import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'
import { isBrowser, resolveSetter } from '../_internal'
import type { Setter } from '../_internal'

export interface StorageOptions<T> {
  /** Custom (de)serializer, default JSON. */
  serializer?: { parse: (raw: string) => T; stringify: (value: T) => string }
}

const EVENT = 'react-hooks-kit:storage'

function getStorage(type: 'local' | 'session'): Storage | null {
  if (!isBrowser) return null
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null // blocked (private mode / SSR)
  }
}

/**
 * Generic synced storage hook (used by useLocalStorage / useSessionStorage).
 * Syncs between components in the same tab AND between browser tabs.
 */
export function useStorage<T>(
  type: 'local' | 'session',
  key: string,
  initialValue: T | (() => T),
  options: StorageOptions<T> = {},
) {
  const serializer = useMemo(
    () => options.serializer ?? { parse: JSON.parse as (raw: string) => T, stringify: JSON.stringify as (v: T) => string },
    [options.serializer],
  )
  const initialRef = useRef<{ value: T } | null>(null)
  if (initialRef.current === null) {
    initialRef.current = { value: typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue }
  }

  const subscribe = useCallback(
    (cb: () => void) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === null || e.key === key) cb()
      }
      const onCustom = (e: Event) => {
        if ((e as CustomEvent<{ key: string; type: string }>).detail.key === key) cb()
      }
      window.addEventListener('storage', onStorage)
      window.addEventListener(EVENT, onCustom)
      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(EVENT, onCustom)
      }
    },
    [key],
  )
  const getSnapshot = () => {
    try {
      return getStorage(type)?.getItem(key) ?? null
    } catch {
      return null
    }
  }
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null)

  const value = useMemo<T>(() => {
    if (raw === null) return initialRef.current!.value
    try {
      return serializer.parse(raw)
    } catch {
      return initialRef.current!.value
    }
  }, [raw, serializer])

  const valueRef = useRef(value)
  valueRef.current = value

  const set = useCallback(
    (next: Setter<T>) => {
      const resolved = resolveSetter(next, valueRef.current)
      try {
        getStorage(type)?.setItem(key, serializer.stringify(resolved))
      } catch (e) {
        console.warn(`[useStorage] cannot write "${key}"`, e)
      }
      window.dispatchEvent(new CustomEvent(EVENT, { detail: { key, type } }))
    },
    [type, key, serializer],
  )
  const remove = useCallback(() => {
    getStorage(type)?.removeItem(key)
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { key, type } }))
  }, [type, key])

  return [value, set, remove] as const
}
