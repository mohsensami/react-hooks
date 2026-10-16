import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatest } from './useLatest';
import { sleep, toError } from './utils';

/** Thrown for non-2xx responses. */
export class FetchError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, statusText: string) {
    super(`HTTP ${status}${statusText ? ` ${statusText}` : ''}`);
    this.name = 'FetchError';
    this.status = status;
    this.statusText = statusText;
  }
}

export type FetchParseAs = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'response';
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseFetchOptions<T> extends Omit<RequestInit, 'signal' | 'body'> {
  /** Request body. Plain objects are JSON-encoded automatically. */
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  /** How to read the response (default: 'json') */
  parseAs?: FetchParseAs;
  /** Set false to skip the request (default: true) */
  enabled?: boolean;
  /** Data shown before the first success */
  initialData?: T;
  /** Cache successful GET results in memory for N ms (default: 0 = no cache) */
  cacheTime?: number;
  /** Retries on network errors / 5xx (default: 0) */
  retry?: number;
  /** Delay between retries in ms, multiplied by attempt number (default: 1000) */
  retryDelay?: number;
  /** Transform the parsed response before storing it */
  select?: (raw: unknown) => T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseFetchReturn<T> {
  data: T | undefined;
  error: Error | undefined;
  status: FetchStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  /** Re-run the request (ignores the cache) */
  refetch: () => Promise<void>;
  /** Abort the in-flight request */
  abort: () => void;
}

const cache = new Map<string, { data: unknown; expires: number }>();

/** Clear the in-memory cache of `useFetch` (optionally only keys containing `search`). */
export function clearFetchCache(search?: string): void {
  if (!search) return cache.clear();
  for (const key of cache.keys()) {
    if (key.includes(search)) cache.delete(key);
  }
}

function isPlainBody(body: unknown): body is Record<string, unknown> | unknown[] {
  if (body === null || typeof body !== 'object') return false;
  if (Array.isArray(body)) return true;
  const proto = Object.getPrototypeOf(body);
  return proto === Object.prototype || proto === null;
}

/**
 * Declarative `fetch` with loading / error state, abort on unmount / url
 * change, retries, JSON helpers and an optional in-memory cache.
 *
 * @example
 * const { data, isLoading, error, refetch } = useFetch<User[]>('/api/users', { cacheTime: 30_000 });
 *
 * // POST
 * useFetch('/api/login', { method: 'POST', body: { user, pass }, enabled: submitted });
 */
export function useFetch<T = unknown>(
  url: string | URL | null | undefined,
  options: UseFetchOptions<T> = {},
): UseFetchReturn<T> {
  const { enabled = true, initialData } = options;
  const optionsRef = useLatest(options);
  const urlString = url ? String(url) : null;
  const active = enabled && urlString !== null;
  const controllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<{
    data: T | undefined;
    error: Error | undefined;
    status: FetchStatus;
  }>({ data: initialData, error: undefined, status: active ? 'loading' : 'idle' });

  const run = useCallback(
    async (force: boolean) => {
      if (urlString === null) return;
      const opts = optionsRef.current;
      const {
        body: rawBody,
        parseAs = 'json',
        cacheTime = 0,
        retry = 0,
        retryDelay = 1000,
        select,
        onSuccess,
        onError,
        headers,
        ...init
      } = opts;

      const method = (init.method ?? 'GET').toUpperCase();
      const bodyIsPlain = isPlainBody(rawBody);
      const body = bodyIsPlain ? JSON.stringify(rawBody) : (rawBody as BodyInit | null | undefined);
      const cacheKey = `${method}:${urlString}:${typeof body === 'string' ? body : ''}`;

      if (!force && cacheTime > 0 && method === 'GET') {
        const hit = cache.get(cacheKey);
        if (hit && hit.expires > Date.now()) {
          setState({ data: hit.data as T, error: undefined, status: 'success' });
          return;
        }
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((prev) => ({ ...prev, error: undefined, status: 'loading' }));

      const requestHeaders = new Headers(headers);
      if (bodyIsPlain && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }

      let attempt = 0;
      for (;;) {
        try {
          const response = await fetch(urlString, {
            ...init,
            body,
            headers: requestHeaders,
            signal: controller.signal,
          });

          if (!response.ok) throw new FetchError(response.status, response.statusText);

          let parsed: unknown;
          if (parseAs === 'response') parsed = response;
          else if (response.status === 204) parsed = undefined;
          else parsed = await response[parseAs]();

          const data = (select ? select(parsed) : parsed) as T;
          if (controller.signal.aborted) return;

          if (cacheTime > 0 && method === 'GET') {
            cache.set(cacheKey, { data, expires: Date.now() + cacheTime });
          }
          setState({ data, error: undefined, status: 'success' });
          onSuccess?.(data);
          return;
        } catch (caught) {
          if (controller.signal.aborted) return;
          const error = toError(caught);
          const retryable = !(error instanceof FetchError) || error.status >= 500;
          if (retryable && attempt < retry) {
            attempt += 1;
            await sleep(retryDelay * attempt);
            if (controller.signal.aborted) return;
            continue;
          }
          setState((prev) => ({ ...prev, error, status: 'error' }));
          onError?.(error);
          return;
        }
      }
    },
    [urlString, optionsRef],
  );

  useEffect(() => {
    if (!active) return;
    void run(false);
    return () => controllerRef.current?.abort();
  }, [active, run]);

  const refetch = useCallback(() => run(true), [run]);
  const abort = useCallback(() => controllerRef.current?.abort(), []);

  return {
    ...state,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    refetch,
    abort,
  };
}
