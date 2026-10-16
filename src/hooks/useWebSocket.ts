import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useLatest } from './useLatest';

export type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed';

export interface WebSocketReconnectOptions {
  /** Max reconnect attempts (default: 5) */
  attempts?: number;
  /** Wait before reconnecting in ms, or a function of the attempt number (default: exponential up to 10s) */
  interval?: number | ((attempt: number) => number);
}

export interface UseWebSocketOptions {
  protocols?: string | string[];
  /** Connect automatically (default: true). Set false and call `connect()` manually. */
  enabled?: boolean;
  /** `true` or options to auto-reconnect after unexpected closes (default: false) */
  reconnect?: boolean | WebSocketReconnectOptions;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export interface UseWebSocketReturn<TMessage> {
  status: WebSocketStatus;
  /** Raw `readyState` (0 | 1 | 2 | 3) */
  readyState: number;
  lastMessage: MessageEvent | null;
  /** Last message parsed as JSON (null when it was not valid JSON) */
  lastJsonMessage: TMessage | null;
  /** Returns `false` when the socket is not open */
  sendMessage: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => boolean;
  sendJsonMessage: (data: unknown) => boolean;
  connect: () => void;
  disconnect: () => void;
  getSocket: () => WebSocket | null;
}

const STATUS_BY_STATE: WebSocketStatus[] = ['connecting', 'open', 'closing', 'closed'];

/**
 * WebSocket with status, JSON helpers and automatic reconnection.
 *
 * @example
 * const { status, lastJsonMessage, sendJsonMessage } = useWebSocket<ChatMessage>(
 *   'wss://echo.websocket.org', { reconnect: true },
 * );
 */
export function useWebSocket<TMessage = unknown>(
  url: string | URL | null | undefined,
  options: UseWebSocketOptions = {},
): UseWebSocketReturn<TMessage> {
  const { enabled = true } = options;
  const optionsRef = useLatest(options);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const attempts = useRef(0);
  const manualClose = useRef(false);

  const [readyState, setReadyState] = useState<number>(3);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [lastJsonMessage, setLastJsonMessage] = useState<TMessage | null>(null);

  const detach = (socket: WebSocket) => {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
  };

  const connect = useEventCallback(() => {
    if (!url) return;
    clearTimeout(reconnectTimer.current);
    manualClose.current = false;

    const previous = socketRef.current;
    if (previous) {
      detach(previous);
      previous.close();
    }

    const { protocols } = optionsRef.current;
    const socket = new WebSocket(String(url), protocols);
    socketRef.current = socket;
    setReadyState(socket.readyState);

    socket.onopen = (event) => {
      attempts.current = 0;
      setReadyState(socket.readyState);
      optionsRef.current.onOpen?.(event);
    };

    socket.onmessage = (event) => {
      setLastMessage(event);
      if (typeof event.data === 'string') {
        try {
          setLastJsonMessage(JSON.parse(event.data) as TMessage);
        } catch {
          setLastJsonMessage(null);
        }
      }
      optionsRef.current.onMessage?.(event);
    };

    socket.onerror = (event) => optionsRef.current.onError?.(event);

    socket.onclose = (event) => {
      if (socketRef.current !== socket) return;
      setReadyState(socket.readyState);
      optionsRef.current.onClose?.(event);

      const reconnect = optionsRef.current.reconnect;
      if (manualClose.current || !reconnect) return;

      const config: WebSocketReconnectOptions = reconnect === true ? {} : reconnect;
      const maxAttempts = config.attempts ?? 5;
      if (attempts.current >= maxAttempts) return;

      attempts.current += 1;
      const wait =
        typeof config.interval === 'function'
          ? config.interval(attempts.current)
          : (config.interval ?? Math.min(1000 * 2 ** (attempts.current - 1), 10_000));
      reconnectTimer.current = setTimeout(connect, wait);
    };
  });

  const disconnect = useCallback(() => {
    manualClose.current = true;
    clearTimeout(reconnectTimer.current);
    socketRef.current?.close();
  }, []);

  useEffect(() => {
    if (!enabled || !url) return;
    connect();

    return () => {
      manualClose.current = true;
      clearTimeout(reconnectTimer.current);
      const socket = socketRef.current;
      if (socket) {
        detach(socket);
        socket.close();
      }
      socketRef.current = null;
    };
  }, [enabled, url, connect]);

  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(data as string | Blob | BufferSource);
    return true;
  }, []);

  const sendJsonMessage = useCallback(
    (data: unknown) => sendMessage(JSON.stringify(data)),
    [sendMessage],
  );

  const getSocket = useCallback(() => socketRef.current, []);

  return {
    status: STATUS_BY_STATE[readyState] ?? 'closed',
    readyState,
    lastMessage,
    lastJsonMessage,
    sendMessage,
    sendJsonMessage,
    connect,
    disconnect,
    getSocket,
  };
}
