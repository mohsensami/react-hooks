import { useCallback, useEffect, useState } from 'react';
import type { SetStateAction } from 'react';
import { useStateRef } from './useStateRef';
import { toError } from './utils';

export interface UseIndexedDBOptions {
  /** Database name (default: 'react-hooks-kit') */
  dbName?: string;
  /** Object store name (default: 'keyval') */
  storeName?: string;
}

export interface UseIndexedDBMeta {
  /** `true` until the stored value has been read */
  isLoading: boolean;
  error: Error | undefined;
  /** Delete this key from the database */
  remove: () => Promise<void>;
}

const connections = new Map<string, Promise<IDBDatabase>>();

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDatabase(dbName: string, storeName: string): Promise<IDBDatabase> {
  const cacheKey = `${dbName}/${storeName}`;
  const cached = connections.get(cacheKey);
  if (cached) return cached;

  const open = (version?: number) =>
    new Promise<IDBDatabase>((resolve, reject) => {
      const request = version ? indexedDB.open(dbName, version) : indexedDB.open(dbName);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  const promise = (async () => {
    const db = await open();
    if (db.objectStoreNames.contains(storeName)) return db;
    const nextVersion = db.version + 1;
    db.close();
    return open(nextVersion);
  })();

  connections.set(cacheKey, promise);
  promise.catch(() => connections.delete(cacheKey));
  return promise;
}

async function withStore<T>(
  options: Required<UseIndexedDBOptions>,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase(options.dbName, options.storeName);
  const transaction = db.transaction(options.storeName, mode);
  return requestToPromise(action(transaction.objectStore(options.storeName)));
}

/**
 * Persist **big / structured** data (objects, Blobs, Files, typed arrays...) in
 * IndexedDB with a `useState`-like API.
 *
 * @example
 * const [notes, setNotes, { isLoading, remove }] = useIndexedDB<string[]>('notes', []);
 * await setNotes((prev) => [...prev, 'new note']);
 */
export function useIndexedDB<T>(
  key: string,
  initialValue: T,
  options: UseIndexedDBOptions = {},
): [value: T, setValue: (value: SetStateAction<T>) => Promise<void>, meta: UseIndexedDBMeta] {
  const { dbName = 'react-hooks-kit', storeName = 'keyval' } = options;
  const [value, setValueState, valueRef] = useStateRef<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [initial] = useState(initialValue);

  useEffect(() => {
    if (typeof indexedDB === 'undefined') {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    withStore<T | undefined>({ dbName, storeName }, 'readonly', (store) => store.get(key))
      .then((stored) => {
        if (cancelled) return;
        setValueState(stored === undefined ? initial : stored);
        setError(undefined);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(toError(caught));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, dbName, storeName, initial, setValueState]);

  const setValue = useCallback(
    async (next: SetStateAction<T>) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next;
      setValueState(resolved);
      try {
        await withStore({ dbName, storeName }, 'readwrite', (store) => store.put(resolved, key));
        setError(undefined);
      } catch (caught) {
        setError(toError(caught));
      }
    },
    [key, dbName, storeName, setValueState, valueRef],
  );

  const remove = useCallback(async () => {
    setValueState(initial);
    try {
      await withStore({ dbName, storeName }, 'readwrite', (store) => store.delete(key));
    } catch (caught) {
      setError(toError(caught));
    }
  }, [key, dbName, storeName, initial, setValueState]);

  return [value, setValue, { isLoading, error, remove }];
}
