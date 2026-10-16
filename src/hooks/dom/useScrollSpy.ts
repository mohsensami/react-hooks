import { useEffect, useState } from 'react'

/**
 * Which section id is currently in view (table of contents highlight).
 * @example const active = useScrollSpy(['intro', 'usage', 'api'], { offset: 80 })
 */
export function useScrollSpy(ids: string[], { offset = 0 } = {}) {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')
  useEffect(() => {
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e)
    if (!els.length) return
    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top)
          else visible.delete(e.target.id)
        }
        const first = els.find((el) => visible.has(el.id))
        if (first) setActive(first.id)
      },
      { rootMargin: `-${offset}px 0px -60% 0px`, threshold: [0, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [key, offset])
  return active
}
