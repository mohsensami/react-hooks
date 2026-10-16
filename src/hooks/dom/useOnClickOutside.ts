import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useLatest } from '../utils/useLatest'

type Ref = RefObject<HTMLElement | null>

/**
 * Calls `handler` when the user clicks / touches outside the element(s).
 * @example useOnClickOutside(menuRef, () => setOpen(false), { enabled: open })
 */
export function useOnClickOutside(
  refs: Ref | Ref[],
  handler: (event: MouseEvent | TouchEvent | PointerEvent) => void,
  { events = ['mousedown', 'touchstart'], enabled = true }: { events?: string[]; enabled?: boolean } = {},
) {
  const handlerRef = useLatest(handler)
  const refsRef = useLatest(refs)
  useEffect(() => {
    if (!enabled) return
    const listener = (e: Event) => {
      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current]
      const target = e.target as Node
      if (list.some((r) => !r.current || r.current.contains(target))) return
      handlerRef.current(e as MouseEvent)
    }
    events.forEach((ev) => document.addEventListener(ev, listener))
    return () => events.forEach((ev) => document.removeEventListener(ev, listener))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, events.join(','), handlerRef, refsRef])
}
