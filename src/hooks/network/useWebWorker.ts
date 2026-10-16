import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnyFn } from '../_internal'

/**
 * Run a heavy PURE function in a Web Worker (keeps UI smooth).
 * The function must not use variables from outside its own body (it is serialized).
 * @example
 * const { run, status } = useWebWorker((n: number) => { let s = 0; for (let i = 0; i < n; i++) s += i; return s })
 * const result = await run(1e9)
 */
export function useWebWorker<F extends AnyFn>(fn: F, { timeout }: { timeout?: number } = {}) {
  const worker = useRef<Worker | null>(null)
  const url = useRef<string | null>(null)
  const pending = useRef<{ resolve: (v: Awaited<ReturnType<F>>) => void; reject: (e: Error) => void } | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error' | 'timeout'>('idle')

  const terminate = useCallback(() => {
    worker.current?.terminate()
    worker.current = null
    if (url.current) URL.revokeObjectURL(url.current)
    url.current = null
    pending.current?.reject(new Error('Worker terminated'))
    pending.current = null
  }, [])

  const run = useCallback(
    (...args: Parameters<F>) =>
      new Promise<Awaited<ReturnType<F>>>((resolve, reject) => {
        terminate()
        const code = `self.onmessage = async (e) => { try { const r = await (${fn.toString()})(...e.data); self.postMessage({ ok: true, r }) } catch (err) { self.postMessage({ ok: false, err: String(err) }) } }`
        url.current = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }))
        const w = new Worker(url.current)
        worker.current = w
        pending.current = { resolve, reject }
        setStatus('running')
        let timer: ReturnType<typeof setTimeout> | undefined
        if (timeout) {
          timer = setTimeout(() => {
            setStatus('timeout')
            terminate()
          }, timeout)
        }
        w.onmessage = (e: MessageEvent<{ ok: boolean; r?: Awaited<ReturnType<F>>; err?: string }>) => {
          clearTimeout(timer)
          const p = pending.current
          pending.current = null
          if (e.data.ok) {
            setStatus('success')
            p?.resolve(e.data.r as Awaited<ReturnType<F>>)
          } else {
            setStatus('error')
            p?.reject(new Error(e.data.err))
          }
          terminate()
        }
        w.onerror = (e) => {
          clearTimeout(timer)
          setStatus('error')
          const p = pending.current
          pending.current = null
          p?.reject(new Error(e.message))
          terminate()
        }
        w.postMessage(args)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn.toString(), timeout, terminate],
  )
  useEffect(() => terminate, [terminate])
  return { run, terminate, status }
}
