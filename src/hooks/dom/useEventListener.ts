import { useEffect } from 'react'
import type { RefObject } from 'react'
import { isBrowser, resolveTarget } from '../_internal'
import { useLatest } from '../utils/useLatest'

type Opts = boolean | AddEventListenerOptions

/**
 * Add an event listener with automatic cleanup (always uses the latest handler).
 * Target: omitted = window, or pass `document`, an element, or a ref.
 * @example
 * useEventListener('resize', () => {})
 * useEventListener('keydown', handler, document)
 * useEventListener('click', handler, buttonRef)
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  target?: undefined | null | Window,
  options?: Opts,
): void
export function useEventListener<K extends keyof DocumentEventMap>(
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  target: Document | RefObject<Document | null>,
  options?: Opts,
): void
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  target: T | RefObject<T | null> | null,
  options?: Opts,
): void
export function useEventListener(
  type: string,
  handler: (event: Event) => void,
  target?: EventTarget | RefObject<EventTarget | null> | null,
  options?: Opts,
): void
export function useEventListener(
  type: string,
  handler: (event: never) => void,
  target?: EventTarget | RefObject<EventTarget | null> | null,
  options?: Opts,
) {
  const ref = useLatest(handler)
  const capture = typeof options === 'object' ? options.capture : options
  const passive = typeof options === 'object' ? options.passive : undefined
  const once = typeof options === 'object' ? options.once : undefined

  useEffect(() => {
    const el = resolveTarget<EventTarget>(target, isBrowser ? window : null)
    if (!el) return
    const listener = (e: Event) => (ref.current as (e: Event) => void)(e)
    el.addEventListener(type, listener, { capture, passive, once })
    return () => el.removeEventListener(type, listener, { capture })
  }, [type, target, capture, passive, once, ref])
}
