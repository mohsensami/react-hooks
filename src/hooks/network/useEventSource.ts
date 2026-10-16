import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Server-Sent Events (EventSource).
 * @example const { data, status } = useEventSource<{ price: number }>('/api/stream', { events: ['tick'] })
 */
export function useEventSource<T = unknown>(
  url: string | null,
  { events = [], withCredentials = false, enabled = true, parseJson = true }: { events?: string[]; withCredentials?: boolean; enabled?: boolean; parseJson?: boolean } = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('closed')
  const [error, setError] = useState<Event | null>(null)
  const source = useRef<EventSource | null>(null)
  const eventsKey = events.join('|')

  useEffect(() => {
    if (!enabled || !url) return
    const es = new EventSource(url, { withCredentials })
    source.current = es
    setStatus('connecting')
    const onMsg = (e: Event) => {
      const raw = (e as MessageEvent).data
      let v: unknown = raw
      if (parseJson) {
        try { v = JSON.parse(raw) } catch { /* text */ }
      }
      setData(v as T)
    }
    es.onopen = () => setStatus('open')
    es.onerror = (e) => {
      setError(e)
      setStatus(es.readyState === EventSource.CLOSED ? 'closed' : 'connecting')
    }
    es.onmessage = onMsg
    const names = eventsKey ? eventsKey.split('|') : []
    names.forEach((n) => es.addEventListener(n, onMsg))
    return () => {
      es.close()
      source.current = null
      setStatus('closed')
    }
  }, [url, enabled, withCredentials, parseJson, eventsKey])

  const close = useCallback(() => {
    source.current?.close()
    setStatus('closed')
  }, [])
  return { data, status, error, close }
}
