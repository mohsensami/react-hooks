import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { isBrowser, resolveTarget } from '../_internal'
import { useLatest } from '../utils/useLatest'

export interface UseKeyPressOptions {
  /** which event triggers the handler. default 'keydown' */
  event?: 'keydown' | 'keyup'
  target?: Document | HTMLElement | RefObject<HTMLElement | null> | null
  preventDefault?: boolean
  enabled?: boolean
}

const matches = (e: KeyboardEvent, keys: string[]) =>
  keys.some((k) => e.key === k || e.code === k || e.key.toLowerCase() === k.toLowerCase())

/**
 * Is a key currently pressed? Optionally runs a handler.
 * Keys can be `e.key` ("Enter", "a") or `e.code` ("KeyA", "Space").
 * @example
 * const escPressed = useKeyPress('Escape')
 * useKeyPress(['Enter'], () => submit(), { preventDefault: true })
 */
export function useKeyPress(
  keys: string | string[],
  handler?: (event: KeyboardEvent) => void,
  { event = 'keydown', target, preventDefault = false, enabled = true }: UseKeyPressOptions = {},
) {
  const [pressed, setPressed] = useState(false)
  const handlerRef = useLatest(handler)
  const list = Array.isArray(keys) ? keys : [keys]
  const keyId = list.join('|')

  useEffect(() => {
    if (!enabled) return
    const el = resolveTarget<EventTarget>(target as never, isBrowser ? document : null)
    if (!el) return
    const down = (e: Event) => {
      const ke = e as KeyboardEvent
      if (!matches(ke, keyId.split('|'))) return
      if (preventDefault) ke.preventDefault()
      setPressed(true)
      if (event === 'keydown') handlerRef.current?.(ke)
    }
    const up = (e: Event) => {
      const ke = e as KeyboardEvent
      if (!matches(ke, keyId.split('|'))) return
      setPressed(false)
      if (event === 'keyup') handlerRef.current?.(ke)
    }
    const blur = () => setPressed(false)
    el.addEventListener('keydown', down)
    el.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      el.removeEventListener('keydown', down)
      el.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [keyId, event, target, preventDefault, enabled, handlerRef])

  return pressed
}
