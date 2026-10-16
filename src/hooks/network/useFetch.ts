import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '../utils/useLatest'

export class HttpError extends Error {
  status: number
  statusText: string
  body: unknown
  constructor(status: number, statusText: string, body?: unknown) {
    super(`HTTP ${status} ${statusText}`)
    this.name = 'HttpError'
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

export interface UseFetchOptions<T> extends Omit<RequestInit, 'body' | 'signal'> {
  /** objects are JSON-stringified automatically */
  body?: BodyInit | Record<string, unknown> | unknown[] | null
  /** how to read the response. default 'json' */
  parse?: 'json' | 'text' | 'blob' | 'arrayBuffer' | ((res: Response) => Promise<T>)
  /** set false to skip (conditional fetching). default true */
  enabled?: boolean
  /** cache successful responses in memory for N ms. default 0 (off) */
  cacheTime?: number
  /** re-fetch every N ms */
  refetchInterval?: number
  retries?: number
  retryDelay?: number
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

const cache = new Map<string, { data: unknown; time: number }>()
/** Clears the useFetch memory cache (all or by url prefix). */
export function clearFetchCache(prefix?: string) {
  if (!prefix) return cache.clear()
  for (const k of cache.keys()) if (k.includes(prefix)) cache.delete(k)
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Data fetching with abort, loading/error state, retries, cache and polling.
 * @example
 * const { data, loading, error, refetch } = useFetch<User[]>('/api/users')
 * const { data } = useFetch(`/api/user/${id}`, { enabled: !!id, cacheTime: 30_000 })
 */
export function useFetch<T = unknown>(url: string | null | undefined, options: UseFetchOptions<T> = {}) {
  const { enabled = true, refetchInterval, cacheTime = 0 } = options
  const [data, setData] = useState<T | undefined>(options.initialData)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(Boolean(url && enabled))
  const opts = useLatest(options)
  const controller = useRef<AbortController | null>(null)
  const runId = useRef(0)

  const bodyKey = options.body && typeof options.body !== 'string' && !(options.body instanceof FormData) ? JSON.stringify(options.body) : String(options.body ?? '')
  const key = `${options.method ?? 'GET'} ${url} ${bodyKey}`

  const run = useCallback(
    async ({ silent = false, skipCache = false } = {}) => {
      if (!url) return
      const o = opts.current
      if (!skipCache && cacheTime > 0) {
        const hit = cache.get(key)
        if (hit && Date.now() - hit.time < cacheTime) {
          setData(hit.data as T)
          setLoading(false)
          setError(null)
          return
        }
      }
      controller.current?.abort()
      const ctrl = new AbortController()
      controller.current = ctrl
      const id = ++runId.current
      if (!silent) setLoading(true)
      const { body, parse = 'json', enabled: _e, cacheTime: _c, refetchInterval: _r, retries = 0, retryDelay = 500, initialData: _i, onSuccess: _s, onError: _er, ...init } = o
      void [_e, _c, _r, _i, _s, _er]
      const headers = new Headers(init.headers)
      let finalBody: BodyInit | null | undefined
      if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof URLSearchParams) && !(body instanceof ArrayBuffer)) {
        finalBody = JSON.stringify(body)
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
      } else finalBody = body as BodyInit | null | undefined

      for (let attempt = 0; ; attempt++) {
        try {
          const res = await fetch(url, { ...init, headers, body: finalBody, signal: ctrl.signal })
          if (!res.ok) throw new HttpError(res.status, res.statusText, await res.text().catch(() => undefined))
          const parsed: T = typeof parse === 'function' ? await parse(res) : ((await res[parse]()) as T)
          if (id !== runId.current) return
          if (cacheTime > 0) cache.set(key, { data: parsed, time: Date.now() })
          setData(parsed)
          setError(null)
          setLoading(false)
          opts.current.onSuccess?.(parsed)
          return
        } catch (e) {
          if ((e as Error).name === 'AbortError' || id !== runId.current) return
          if (attempt < retries && !(e instanceof HttpError && e.status < 500)) {
            await sleep(retryDelay * (attempt + 1))
            continue
          }
          const err = e instanceof Error ? e : new Error(String(e))
          setError(err)
          setLoading(false)
          opts.current.onError?.(err)
          return
        }
      }
    },
    [url, key, cacheTime, opts],
  )

  useEffect(() => {
    if (!enabled || !url) {
      setLoading(false)
      return
    }
    void run()
    return () => controller.current?.abort()
  }, [enabled, url, run])

  useEffect(() => {
    if (!refetchInterval || !enabled || !url) return
    const id = setInterval(() => void run({ silent: true, skipCache: true }), refetchInterval)
    return () => clearInterval(id)
  }, [refetchInterval, enabled, url, run])

  const refetch = useCallback(() => run({ skipCache: true }), [run])
  const abort = useCallback(() => {
    controller.current?.abort()
    setLoading(false)
  }, [])

  return { data, error, loading, isError: !!error, refetch, abort, mutate: setData }
}
