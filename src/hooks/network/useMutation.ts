import { useCallback, useRef, useState } from 'react'
import { useLatest } from '../utils/useLatest'
import type { AsyncStatus } from './useAsync'

export interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void
  onError?: (error: Error, variables: V) => void
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void
}

/**
 * For writes (POST / PUT / DELETE) – runs only when you call `mutate`.
 * @example
 * const { mutate, isPending } = useMutation((body: Todo) => api.create(body), { onSuccess: refresh })
 * <button disabled={isPending} onClick={() => mutate(todo)}>
 */
export function useMutation<T, V = void>(fn: (variables: V) => Promise<T>, options: UseMutationOptions<T, V> = {}) {
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const fnRef = useLatest(fn)
  const optsRef = useLatest(options)
  const runId = useRef(0)

  const mutateAsync = useCallback(
    async (variables: V): Promise<T> => {
      const id = ++runId.current
      setStatus('pending')
      setError(null)
      try {
        const result = await fnRef.current(variables)
        if (id === runId.current) {
          setData(result)
          setStatus('success')
        }
        optsRef.current.onSuccess?.(result, variables)
        optsRef.current.onSettled?.(result, null, variables)
        return result
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        if (id === runId.current) {
          setError(err)
          setStatus('error')
        }
        optsRef.current.onError?.(err, variables)
        optsRef.current.onSettled?.(undefined, err, variables)
        throw err
      }
    },
    [fnRef, optsRef],
  )
  /** Fire-and-forget version – errors are stored in `error`, never thrown. */
  const mutate = useCallback((variables: V) => void mutateAsync(variables).catch(() => {}), [mutateAsync])
  const reset = useCallback(() => {
    runId.current++
    setData(undefined)
    setError(null)
    setStatus('idle')
  }, [])

  return { mutate, mutateAsync, reset, data, error, status, isPending: status === 'pending', isSuccess: status === 'success', isError: status === 'error' }
}
