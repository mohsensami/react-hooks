import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatest } from './useLatest';

export interface UseBroadcastChannelReturn<T> {
  /** Send a message to every OTHER tab / window / iframe on the same channel */
  post: (message: T) => void;
  /** Last message received from another tab */
  lastMessage: T | null;
  close: () => void;
  isSupported: boolean;
}

/**
 * Talk to other tabs of the same origin with the BroadcastChannel API.
 *
 * @example
 * const { post, lastMessage } = useBroadcastChannel<{ type: 'logout' }>('auth');
 * post({ type: 'logout' });
 */
export function useBroadcastChannel<T = unknown>(
  name: string,
  onMessage?: (message: T) => void,
): UseBroadcastChannelReturn<T> {
  const isSupported = typeof BroadcastChannel !== 'undefined';
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onMessageRef = useLatest(onMessage);
  const [lastMessage, setLastMessage] = useState<T | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    const channel = new BroadcastChannel(name);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<T>) => {
      setLastMessage(event.data);
      onMessageRef.current?.(event.data);
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [name, isSupported, onMessageRef]);

  const post = useCallback((message: T) => channelRef.current?.postMessage(message), []);
  const close = useCallback(() => {
    channelRef.current?.close();
    channelRef.current = null;
  }, []);

  return { post, lastMessage, close, isSupported };
}
