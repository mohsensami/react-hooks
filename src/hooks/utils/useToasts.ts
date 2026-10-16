import { useCallback, useEffect, useRef, useState } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration: number
}

/**
 * Toast / snackbar queue with auto dismiss.
 * @example const { toasts, add, remove } = useToasts({ duration: 3000, max: 5 })
 */
export function useToasts({ duration = 3000, max = 5 }: { duration?: number; max?: number } = {}) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const remove = useCallback((id: string) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const add = useCallback(
    (message: string, options: Partial<Pick<Toast, 'type' | 'duration'>> = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const toast: Toast = { id, message, type: options.type ?? 'info', duration: options.duration ?? duration }
      setToasts((t) => [...t, toast].slice(-max))
      if (toast.duration > 0) timers.current.set(id, setTimeout(() => remove(id), toast.duration))
      return id
    },
    [duration, max, remove],
  )

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current.clear()
    setToasts([])
  }, [])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  return { toasts, add, remove, clear }
}
