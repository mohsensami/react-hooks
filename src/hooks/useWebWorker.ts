import { useCallback, useEffect, useRef, useState } from 'react';
import { toError } from './utils';

export type WebWorkerStatus = 'idle' | 'running' | 'success' | 'error' | 'terminated';

export interface UseWebWorkerOptions {
  /** Reject and terminate the worker when a run takes longer than N ms */
  timeout?: number;
}

export interface UseWebWorkerReturn<I, O> {
  /** Run the function in the worker thread */
  run: (input: I) => Promise<O>;
  result: O | undefined;
  error: Error | undefined;
  status: WebWorkerStatus;
  /** Kill the worker (a new one is created automatically on the next `run`) */
  terminate: () => void;
}

interface Pending {
  resolve: (value: never) => void;
  reject: (reason: Error) => void;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Run a heavy, **self-contained** function in a Web Worker without blocking the UI.
 * The function is serialized with `toString()`, so it cannot use variables from
 * the outer scope (imports, closures). Define it outside the component.
 *
 * @example
 * const fibWorker = (n: number): number => {
 *   const fib = (x: number): number => (x < 2 ? x : fib(x - 1) + fib(x - 2));
 *   return fib(n);
 * };
 * const { run, status, result } = useWebWorker(fibWorker);
 * run(40);
 */
export function useWebWorker<I, O>(
  workerFn: (input: I) => O | Promise<O>,
  options: UseWebWorkerOptions = {},
): UseWebWorkerReturn<I, O> {
  const { timeout } = options;
  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);
  const pending = useRef(new Map<number, Pending>());
  const counter = useRef(0);
  const fnRef = useRef(workerFn);
  fnRef.current = workerFn;

  const [status, setStatus] = useState<WebWorkerStatus>('idle');
  const [result, setResult] = useState<O | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const rejectAll = useCallback((reason: Error) => {
    pending.current.forEach((entry) => {
      clearTimeout(entry.timer);
      entry.reject(reason);
    });
    pending.current.clear();
  }, []);

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    rejectAll(new Error('Worker terminated'));
    setStatus('terminated');
  }, [rejectAll]);

  const getWorker = useCallback((): Worker => {
    if (workerRef.current) return workerRef.current;

    const source = `
      const fn = (${fnRef.current.toString()});
      self.onmessage = async (event) => {
        const { id, input } = event.data;
        try {
          const result = await fn(input);
          self.postMessage({ id, result });
        } catch (error) {
          self.postMessage({ id, error: (error && error.message) || String(error) });
        }
      };
    `;
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    const worker = new Worker(url);
    urlRef.current = url;

    worker.onmessage = (event: MessageEvent<{ id: number; result?: unknown; error?: string }>) => {
      const { id, result: value, error: message } = event.data;
      const entry = pending.current.get(id);
      if (!entry) return;
      clearTimeout(entry.timer);
      pending.current.delete(id);
      if (message !== undefined) entry.reject(new Error(message));
      else entry.resolve(value as never);
    };

    worker.onerror = (event) => {
      rejectAll(new Error(event.message || 'Worker error'));
    };

    workerRef.current = worker;
    return worker;
  }, [rejectAll]);

  const run = useCallback(
    (input: I): Promise<O> => {
      const worker = getWorker();
      const id = ++counter.current;
      setStatus('running');
      setError(undefined);

      return new Promise<O>((resolve, reject) => {
        const entry: Pending = {
          resolve: resolve as (value: never) => void,
          reject,
        };

        if (timeout !== undefined) {
          entry.timer = setTimeout(() => {
            pending.current.delete(id);
            reject(new Error(`Worker timed out after ${timeout}ms`));
            terminate();
          }, timeout);
        }

        pending.current.set(id, entry);
        worker.postMessage({ id, input });
      }).then(
        (value) => {
          setResult(value);
          setStatus('success');
          return value;
        },
        (reason: unknown) => {
          const err = toError(reason);
          setError(err);
          setStatus((prev) => (prev === 'terminated' ? prev : 'error'));
          throw err;
        },
      );
    },
    [getWorker, timeout, terminate],
  );

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
      pending.current.clear();
    },
    [],
  );

  return { run, result, error, status, terminate };
}
