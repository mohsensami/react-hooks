import { useEffect } from 'react'
import type { RefObject } from 'react'
import { isBrowser, resolveTarget } from '../_internal'
import { useLatest } from '../utils/useLatest'

export interface UseHotkeysOptions {
  preventDefault?: boolean
  enabled?: boolean
  /** fire while typing in input / textarea / select. default false */
  enableOnFormTags?: boolean
  target?: Document | HTMLElement | RefObject<HTMLElement | null> | null
  /** ignore key auto-repeat when holding. default true */
  ignoreRepeat?: boolean
}

const isMac = isBrowser && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
const ALIASES: Record<string, string> = {
  esc: 'escape', space: ' ', spacebar: ' ', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright',
  del: 'delete', return: 'enter', plus: '+', comma: ',', dot: '.',
}

interface Parsed { key: string; ctrl: boolean; alt: boolean; shift: boolean; meta: boolean }

function parse(combo: string): Parsed {
  const p: Parsed = { key: '', ctrl: false, alt: false, shift: false, meta: false }
  for (const raw of combo.toLowerCase().split('+').map((s) => s.trim())) {
    if (raw === 'ctrl' || raw === 'control') p.ctrl = true
    else if (raw === 'alt' || raw === 'option') p.alt = true
    else if (raw === 'shift') p.shift = true
    else if (raw === 'meta' || raw === 'cmd' || raw === 'command' || raw === 'win') p.meta = true
    else if (raw === 'mod') isMac ? (p.meta = true) : (p.ctrl = true)
    else p.key = ALIASES[raw] ?? raw
  }
  return p
}

function test(e: KeyboardEvent, p: Parsed) {
  if (e.ctrlKey !== p.ctrl || e.altKey !== p.alt || e.shiftKey !== p.shift || e.metaKey !== p.meta) return false
  const key = e.key.toLowerCase()
  return key === p.key || e.code.toLowerCase() === `key${p.key}` || e.code.toLowerCase() === `digit${p.key}`
}

/**
 * Keyboard shortcuts. `mod` = Cmd on Mac, Ctrl elsewhere.
 * @example
 * useHotkeys('mod+k', () => openSearch(), { preventDefault: true })
 * useHotkeys(['ctrl+s', 'meta+s'], save)
 * useHotkeys('shift+/', showHelp)
 */
export function useHotkeys(
  combos: string | string[],
  handler: (event: KeyboardEvent, combo: string) => void,
  { preventDefault = true, enabled = true, enableOnFormTags = false, target, ignoreRepeat = true }: UseHotkeysOptions = {},
) {
  const ref = useLatest(handler)
  const id = (Array.isArray(combos) ? combos : [combos]).join('\n')

  useEffect(() => {
    if (!enabled) return
    const el = resolveTarget<EventTarget>(target as never, isBrowser ? document : null)
    if (!el) return
    const list = id.split('\n').map((c) => ({ combo: c, parsed: parse(c) }))
    const onKey = (ev: Event) => {
      const e = ev as KeyboardEvent
      if (ignoreRepeat && e.repeat) return
      const tag = (e.target as HTMLElement | null)?.tagName
      const inForm = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement | null)?.isContentEditable
      if (inForm && !enableOnFormTags) return
      const hit = list.find((l) => test(e, l.parsed))
      if (!hit) return
      if (preventDefault) e.preventDefault()
      ref.current(e, hit.combo)
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [id, enabled, enableOnFormTags, target, preventDefault, ignoreRepeat, ref])
}
