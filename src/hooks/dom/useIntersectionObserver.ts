import { useEffect, useState } from 'react'
import type { RefCallback } from 'react'

export interface UseIntersectionObserverOptions {
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
  /** stop observing after the first time it becomes visible */
  freezeOnceVisible?: boolean
}

/**
 * IntersectionObserver for one element.
 * @example const [ref, entry] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.5 })
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}): [RefCallback<T>, IntersectionObserverEntry | null] {
  const [el, setEl] = useState<T | null>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const frozen = freezeOnceVisible && !!entry?.isIntersecting
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold)

  useEffect(() => {
    if (!el || frozen || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setEntry(e), {
      root,
      rootMargin,
      threshold: thresholdKey.split(',').map(Number),
    })
    io.observe(el)
    return () => io.disconnect()
  }, [el, frozen, root, rootMargin, thresholdKey])

  return [setEl, entry]
}

/**
 * Simply: is the element visible in the viewport?
 * @example const [ref, inView] = useInView<HTMLDivElement>({ freezeOnceVisible: true })
 */
export function useInView<T extends Element = HTMLDivElement>(options?: UseIntersectionObserverOptions) {
  const [ref, entry] = useIntersectionObserver<T>(options)
  return [ref, !!entry?.isIntersecting] as const
}
