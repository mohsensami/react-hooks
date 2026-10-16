import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface AddToastOptions {
  type?: ToastType;
  /** ms before auto-dismiss, 0 = sticky (default 3000) */
  duration?: number;
}

/**
 * Minimal toast/notification queue manager (you render the UI).
 *
 * @example
 * const { toasts, add, remove } = useToasts();
 * add('Saved!', { type: 'success' });
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const add = useCallback(
    (message: string, { type = 'info', duration = 3000 }: AddToastOptions = {}) => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration > 0) timers.current.set(id, setTimeout(() => remove(id), duration));
      return id;
    },
    [remove],
  );

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return { toasts, add, remove, clear };
}
