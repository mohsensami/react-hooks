import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '../utils/useLatest'

/**
 * Talk between tabs / windows of the same origin.
 * @example const { post, lastMessage } = useBroadcastChannel<string>('chat')
 */
export function useBroadcastChannel<T = unknown>(name: string, onMessage?: (data: T) => void) {
  const channel = useRef<BroadcastChannel | null>(null)
  const [lastMessage, setLastMessage] = useState<T | null>(null)
  const cb = useLatest(onMessage)
  const isSupported = typeof BroadcastChannel !== 'undefined'

  useEffect(() => {
    if (!isSupported) return
    const ch = new BroadcastChannel(name)
    channel.current = ch
    ch.onmessage = (e: MessageEvent<T>) => {
      setLastMessage(e.data)
      cb.current?.(e.data)
    }
    return () => {
      ch.close()
      channel.current = null
    }
  }, [name, isSupported, cb])

  const post = useCallback((data: T) => channel.current?.postMessage(data), [])
  return { post, lastMessage, isSupported }
}
