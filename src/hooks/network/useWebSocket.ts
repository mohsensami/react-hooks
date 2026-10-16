import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '../utils/useLatest'

export type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed'

export interface UseWebSocketOptions<T> {
  protocols?: string | string[]
  /** auto reconnect when closed unexpectedly. default true */
  reconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
  /** send `message` every `interval` ms to keep the connection alive */
  heartbeat?: { message: string; interval: number }
  /** JSON.parse incoming messages. default true */
  parseJson?: boolean
  enabled?: boolean
  onOpen?: (e: Event) => void
  onMessage?: (data: T, e: MessageEvent) => void
  onClose?: (e: CloseEvent) => void
  onError?: (e: Event) => void
}

/**
 * WebSocket with auto-reconnect and heartbeat.
 * @example const { status, data, send } = useWebSocket<Msg>('wss://echo.example/ws'); send({ hi: 1 })
 */
export function useWebSocket<T = unknown>(url: string | null, options: UseWebSocketOptions<T> = {}) {
  const { enabled = true } = options
  const opts = useLatest(options)
  const ws = useRef<WebSocket | null>(null)
  const retries = useRef(0)
  const manual = useRef(false)
  const [status, setStatus] = useState<WebSocketStatus>('closed')
  const [data, setData] = useState<T | null>(null)
  const [history, setHistory] = useState<T[]>([])

  const connect = useCallback(() => {
    if (!url) return
    manual.current = false
    ws.current?.close()
    const socket = new WebSocket(url, opts.current.protocols)
    ws.current = socket
    setStatus('connecting')
    let heartbeat: ReturnType<typeof setInterval> | undefined
    let retry: ReturnType<typeof setTimeout> | undefined

    socket.onopen = (e) => {
      retries.current = 0
      setStatus('open')
      const hb = opts.current.heartbeat
      if (hb) heartbeat = setInterval(() => socket.readyState === 1 && socket.send(hb.message), hb.interval)
      opts.current.onOpen?.(e)
    }
    socket.onmessage = (e) => {
      let value: unknown = e.data
      if (opts.current.parseJson !== false && typeof e.data === 'string') {
        try { value = JSON.parse(e.data) } catch { /* plain text */ }
      }
      setData(value as T)
      setHistory((h) => [...h.slice(-99), value as T])
      opts.current.onMessage?.(value as T, e)
    }
    socket.onerror = (e) => opts.current.onError?.(e)
    socket.onclose = (e) => {
      clearInterval(heartbeat)
      setStatus('closed')
      opts.current.onClose?.(e)
      const { reconnect = true, reconnectAttempts = 10, reconnectInterval = 2000 } = opts.current
      if (!manual.current && reconnect && ws.current === socket && retries.current < reconnectAttempts) {
        retries.current += 1
        retry = setTimeout(connect, reconnectInterval)
      }
    }
    // cleanup for this socket's timers when replaced
    socket.addEventListener('close', () => clearTimeout(retry), { once: true })
  }, [url, opts])

  const disconnect = useCallback(() => {
    manual.current = true
    setStatus('closing')
    ws.current?.close()
  }, [])

  const send = useCallback((message: unknown) => {
    if (ws.current?.readyState !== WebSocket.OPEN) return false
    ws.current.send(typeof message === 'string' || message instanceof Blob || message instanceof ArrayBuffer ? message : JSON.stringify(message))
    return true
  }, [])

  useEffect(() => {
    if (!enabled || !url) return
    connect()
    return () => {
      manual.current = true
      ws.current?.close()
      ws.current = null
    }
  }, [enabled, url, connect])

  return { status, data, history, send, connect, disconnect, socket: ws }
}
