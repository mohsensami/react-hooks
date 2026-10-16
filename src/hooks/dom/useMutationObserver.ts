import { useEffect } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'
import { useLatest } from '../utils/useLatest'

/**
 * Observe DOM changes (children, attributes, text) of an element / ref.
 * @example useMutationObserver(ref, records => console.log(records), { childList: true })
 */
export function useMutationObserver(
  target: TargetLike<Node>,
  callback: MutationCallback,
  options: MutationObserverInit = { attributes: true, childList: true, subtree: true },
) {
  const cb = useLatest(callback)
  const key = JSON.stringify(options)
  useEffect(() => {
    const el = resolveTarget<Node>(target)
    if (!el) return
    const mo = new MutationObserver((r, o) => cb.current(r, o))
    mo.observe(el, JSON.parse(key))
    return () => mo.disconnect()
  }, [target, key, cb])
}
