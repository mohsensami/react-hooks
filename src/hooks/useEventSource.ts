import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatest } from './useLatest';

export type EventSourceStatus = 'connecting' | 'open' | 'closed';

export interface UseEventSourceOptions {
  /** Named events to listen to besides the default `message` (default: []) */
  events?: string[];
  withCredentials?: boolean;
  /** Connect automatically (default: true) */
  enabled?: boolean;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
}

export interface UseEventSourceReturn {
  status: EventSourceStatus;
  /** `data` of the last received event */
  data: string | null;
  /** Name of the last received event (`message` by default) */
  lastEventType: string | null;
  lastEvent: MessageEvent | null;
  error: Event | null;
  close: () => void;
  /** Close and open a new connection */
  reconnect: () => void;
}

/**
 * Server-Sent Events (`EventSource`) as a hook.
 *
 * @example
 * const { data, status } = useEventSource('/api/stream', { events: ['price'] });
 */
export function useEventSource(
  url: string | URL | null | undefined,
  options: UseEventSourceOptions = {},
): UseEventSourceReturn {
  const { enabled = true, withCredentials = false } = options;
  const optionsRef = useLatest(options);
  const eventsKey = (options.events ?? []).join(',');
  const sourceRef = useRef<EventSource | null>(null);
  const [status, setStatus] = useState<EventSourceStatus>('closed');
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null);
  const [lastEventType, setLastEventType] = useState<string | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled || !url) return;

    const source = new EventSource(String(url), { withCredentials });
    sourceRef.current = source;
    setStatus('connecting');
    setError(null);

    const handleMessage = (event: Event) => {
      const message = event as MessageEvent;
      setLastEvent(message);
      setLastEventType(message.type);
      optionsRef.current.onMessage?.(message);
    };

    source.onopen = (event) => {
      setStatus('open');
      optionsRef.current.onOpen?.(event);
    };
    source.onerror = (event) => {
      setError(event);
      setStatus(source.readyState === EventSource.CLOSED ? 'closed' : 'connecting');
      optionsRef.current.onError?.(event);
    };
    source.addEventListener('message', handleMessage);

    const names = eventsKey.split(',').filter(Boolean);
    names.forEach((name) => source.addEventListener(name, handleMessage));

    return () => {
      source.close();
      sourceRef.current = null;
      setStatus('closed');
    };
  }, [url, enabled, withCredentials, eventsKey, version, optionsRef]);

  const close = useCallback(() => {
    sourceRef.current?.close();
    setStatus('closed');
  }, []);

  const reconnect = useCallback(() => setVersion((v) => v + 1), []);

  return {
    status,
    data: lastEvent && typeof lastEvent.data === 'string' ? lastEvent.data : null,
    lastEventType,
    lastEvent,
    error,
    close,
    reconnect,
  };
}
