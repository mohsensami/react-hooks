import { useCallback, useEffect, useRef, useState } from 'react'

const wrap = <T,>(req: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

/**
 * Minimal key-value IndexedDB store (async, large data, blobs allowed).
 * @example
 * const db = useIndexedDB<Note>('my-app', 'notes')
 * await db.set('n1', { text: 'hi' }); const n = await db.get('n1')
 */
export function useIndexedDB<T = unknown>(dbName: string, storeName: string) {
  const dbRef = useRef<IDBDatabase | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (typeof indexedDB === 'undefined') return
    let cancelled = false
    const open = indexedDB.open(dbName, 1)
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains(storeName)) open.result.createObjectStore(storeName)
    }
    open.onsuccess = () => {
      if (cancelled) return open.result.close()
      dbRef.current = open.result
      setReady(true)
    }
    open.onerror = () => setError(open.error)
    return () => {
      cancelled = true
      dbRef.current?.close()
      dbRef.current = null
      setReady(false)
    }
  }, [dbName, storeName])

  const store = useCallback(
    (mode: IDBTransactionMode) => {
      if (!dbRef.current) throw new Error('IndexedDB is not ready yet')
      return dbRef.current.transaction(storeName, mode).objectStore(storeName)
    },
    [storeName],
  )

  return {
    ready,
    error,
    get: useCallback((key: IDBValidKey) => wrap<T | undefined>(store('readonly').get(key)), [store]),
    set: useCallback(async (key: IDBValidKey, value: T) => void (await wrap(store('readwrite').put(value, key))), [store]),
    remove: useCallback(async (key: IDBValidKey) => void (await wrap(store('readwrite').delete(key))), [store]),
    clear: useCallback(async () => void (await wrap(store('readwrite').clear())), [store]),
    keys: useCallback(() => wrap<IDBValidKey[]>(store('readonly').getAllKeys()), [store]),
    getAll: useCallback(() => wrap<T[]>(store('readonly').getAll()), [store]),
  }
}
