import { useEffect, useState } from 'react'
import type { RefCallback } from 'react'

/**
 * Is the element itself focused?
 * @example const [ref, focused] = useFocus<HTMLInputElement>()
 */
export function useFocus<T extends HTMLElement = HTMLElement>(): [RefCallback<T>, boolean] {
  const [el, setEl] = useState<T | null>(null)
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!el) return
    setFocused(document.activeElement === el)
    const on = () => setFocused(true)
    const off = () => setFocused(false)
    el.addEventListener('focus', on)
    el.addEventListener('blur', off)
    return () => {
      el.removeEventListener('focus', on)
      el.removeEventListener('blur', off)
    }
  }, [el])
  return [setEl, focused]
}

/**
 * Is focus anywhere INSIDE the element (including children)?
 * @example const [ref, within] = useFocusWithin<HTMLFormElement>()
 */
export function useFocusWithin<T extends HTMLElement = HTMLElement>(): [RefCallback<T>, boolean] {
  const [el, setEl] = useState<T | null>(null)
  const [within, setWithin] = useState(false)
  useEffect(() => {
    if (!el) return
    const on = () => setWithin(true)
    const off = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setWithin(false)
    }
    el.addEventListener('focusin', on)
    el.addEventListener('focusout', off)
    return () => {
      el.removeEventListener('focusin', on)
      el.removeEventListener('focusout', off)
    }
  }, [el])
  return [setEl, within]
}
