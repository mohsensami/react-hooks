import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import type { SetStateAction } from 'react';
import { useLatest } from './useLatest';
import { isBrowser } from './utils';

export type StorageType = 'local' | 'session';

export interface UseStorageOptions<T> {
  /** 'local' (default) or 'session' */
  storage?: StorageType;
  /** Custom serializer (default: JSON.stringify) */
  serializer?: (value: T) => string;
  /** Custom deserializer (default: JSON.parse) */
  deserializer?: (raw: string) => T;
}

export type UseStorageReturn<T> = [
  value: T,
  setValue: (value: SetStateAction<T>) => void,
  remove: () => void,
];

const SYNC_EVENT = 'react-hooks-kit:storage';

// Fallback used when Web Storage is unavailable (SSR, blocked, private mode quota ...)
const memoryStorage = {
  local: new Map<string, string>(),
  session: new Map<string, string>(),
};

function getStorage(type: StorageType): Storage | null {
  if (!isBrowser) return null;
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorageRaw(type: StorageType, key: string): string | null {
  const storage = getStorage(type);
  try {
    if (storage) return storage.getItem(key);
  } catch {
    /* fall through to memory */
  }
  return memoryStorage[type].get(key) ?? null;
}

export function writeStorageRaw(type: StorageType, key: string, value: string): void {
  const storage = getStorage(type);
  try {
    if (storage) {
      storage.setItem(key, value);
      memoryStorage[type].delete(key);
    } else {
      memoryStorage[type].set(key, value);
    }
  } catch {
    memoryStorage[type].set(key, value);
  }
  window.dispatchEvent(new Event(SYNC_EVENT));
}

export function removeStorageRaw(type: StorageType, key: string): void {
  try {
    getStorage(type)?.removeItem(key);
  } catch {
    /* ignore */
  }
  memoryStorage[type].delete(key);
  window.dispatchEvent(new Event(SYNC_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback); // other tabs
  window.addEventListener(SYNC_EVENT, callback); // this tab (other hook instances)
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SYNC_EVENT, callback);
  };
}

/**
 * Generic Web Storage hook. Prefer {@link useLocalStorage} / {@link useSessionStorage}.
 * Values are JSON-serialized, synced between every component using the same key
 * and (for localStorage) between browser tabs. Never throws when storage is blocked.
 */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseStorageOptions<T> = {},
): UseStorageReturn<T> {
  const { storage = 'local', serializer = JSON.stringify, deserializer } = options;
  const [initial] = useState<T>(initialValue);
  const serializerRef = useLatest(serializer);
  const deserializerRef = useLatest(deserializer);

  const parse = useCallback(
    (raw: string): T => {
      try {
        const custom = deserializerRef.current;
        return custom ? custom(raw) : (JSON.parse(raw) as T);
      } catch {
        return initial;
      }
    },
    [deserializerRef, initial],
  );

  const raw = useSyncExternalStore(
    subscribe,
    () => readStorageRaw(storage, key),
    () => null,
  );

  const value = useMemo(() => (raw === null ? initial : parse(raw)), [raw, initial, parse]);

  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const currentRaw = readStorageRaw(storage, key);
      const current = currentRaw === null ? initial : parse(currentRaw);
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
      writeStorageRaw(storage, key, serializerRef.current(resolved));
    },
    [storage, key, initial, parse, serializerRef],
  );

  const remove = useCallback(() => removeStorageRaw(storage, key), [storage, key]);

  return [value, setValue, remove];
}
