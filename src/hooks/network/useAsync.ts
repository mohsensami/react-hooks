import { useCallback, useEffect, useRef, useState } from 'react'
import type { DependencyList } from 'react'
import { useLatest } from '../utils/useLatest'

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

export interface UseAsyncOptions<T, A extends unknown[]> {
  /** run on mount / when `deps` change. default true */
  immediate?: boolean
  /** arguments for the automatic (immediate) call */
  args?: A
  deps?: DependencyList
  initialData?: T
  /** retry count on failure. default 0 */
  retries?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Run an async function and track { data, error, status }.
 * Stale responses are ignored (race-condition safe). `execute` never throws.
 * @example
 * const { data, loading, error, execute } = useAsync(() => api.getUser(id), { deps: [id] })
 * const save = useAsync(api.save, { immediate: false }); save.execute(payload)
 */
export function useAsync<T, A extends unknown[] = []>(fn: (...args: A) => Promise<T>, options: UseAsyncOptions<T, A> = {}) {
  const { immediate = true, deps = [], initialData, retries = 0, retryDelay = 500 } = options
  const [data, setData] = useState<T | undefined>(initialData)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<AsyncStatus>(immediate ? 'pending' : 'idle')
  const fnRef = useLatest(fn)
  const optsRef = useLatest(options)
  const runId = useRef(0)

  const execute = useCallback(
    async (...args: A): Promise<T | undefined> => {
      const id = ++runId.current
      setStatus('pending')
      setError(null)
      let attempt = 0
      for (;;) {
        try {
          const result = await fnRef.current(...args)
          if (id !== runId.current) return undefined
          setData(result)
          setStatus('success')
          optsRef.current.onSuccess?.(result)
          return result
        } catch (e) {
          if (id !== runId.current) return undefined
          if (attempt < retries) {
            attempt += 1
            await sleep(retryDelay * attempt)
            if (id !== runId.current) return undefined
            continue
          }
          const err = e instanceof Error ? e : new Error(String(e))
          setError(err)
          setStatus('error')
          optsRef.current.onError?.(err)
          return undefined
        }
      }
    },
    [fnRef, optsRef, retries, retryDelay],
  )

  const reset = useCallback(() => {
    runId.current++
    setData(initialData)
    setError(null)
    setStatus('idle')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (immediate) void execute(...((options.args ?? []) as A))
    return () => {
      runId.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps])

  return { data, error, status, loading: status === 'pending', isSuccess: status === 'success', isError: status === 'error', execute, reset, setData }
}
