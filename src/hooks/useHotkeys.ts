import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useLatest } from './useLatest';
import { resolveTarget } from './utils';

export interface UseHotkeysOptions {
  /** Listen on this target (default: document) */
  target?: Document | HTMLElement | RefObject<HTMLElement | null> | null;
  /** Call `preventDefault()` when a shortcut matches (default: true) */
  preventDefault?: boolean;
  /** Fire while typing in inputs / textareas / contenteditable (default: false) */
  enableOnFormTags?: boolean;
  /** Ignore repeated events while a key is held (default: true) */
  ignoreRepeat?: boolean;
  enabled?: boolean;
}

export type HotkeyHandler = (event: KeyboardEvent) => void;
/** `{ 'mod+k': openSearch, 'shift+?': showHelp, 'g i': goInbox }` */
export type HotkeyMap = Record<string, HotkeyHandler>;

const ALIASES: Record<string, string> = {
  esc: 'escape',
  space: ' ',
  spacebar: ' ',
  return: 'enter',
  del: 'delete',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  plus: '+',
  option: 'alt',
  cmd: 'meta',
  command: 'meta',
  control: 'ctrl',
};

const isMac = () => typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

interface ParsedCombo {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

function parseCombo(combo: string): ParsedCombo {
  const parts = combo
    .toLowerCase()
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);
  // "ctrl++" -> the key is "+"
  if (combo.trim().endsWith('++')) parts.push('+');

  const result: ParsedCombo = { key: '', ctrl: false, meta: false, alt: false, shift: false };
  for (const raw of parts) {
    const part = ALIASES[raw] ?? raw;
    if (part === 'mod') {
      if (isMac()) result.meta = true;
      else result.ctrl = true;
    } else if (part === 'ctrl') result.ctrl = true;
    else if (part === 'meta') result.meta = true;
    else if (part === 'alt') result.alt = true;
    else if (part === 'shift') result.shift = true;
    else result.key = part;
  }
  return result;
}

function matchesCombo(event: KeyboardEvent, combo: ParsedCombo): boolean {
  const key = (ALIASES[event.key.toLowerCase()] ?? event.key.toLowerCase());
  const keyMatches =
    key === combo.key ||
    event.code.toLowerCase() === combo.key ||
    event.code.toLowerCase() === `key${combo.key}` ||
    event.code.toLowerCase() === `digit${combo.key}`;

  // For symbol keys like "?" shift is implied by the key, so don't require an exact shift match.
  const isSymbol = combo.key.length === 1 && !/[a-z0-9]/.test(combo.key);
  const shiftOk = isSymbol ? true : event.shiftKey === combo.shift;

  return (
    keyMatches &&
    event.ctrlKey === combo.ctrl &&
    event.metaKey === combo.meta &&
    event.altKey === combo.alt &&
    shiftOk
  );
}

const isFormTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
};

/**
 * Keyboard shortcuts. Supports modifiers (`ctrl`, `shift`, `alt`, `meta`, `mod` =
 * Cmd on Mac / Ctrl elsewhere), multiple shortcuts per handler (`'ctrl+k, mod+/'`)
 * and key sequences (`'g i'` = press g, then i).
 *
 * @example
 * useHotkeys({
 *   'mod+k': () => setSearchOpen(true),
 *   'escape': () => setSearchOpen(false),
 *   'g h': () => navigate('/'),
 * });
 */
export function useHotkeys(hotkeys: HotkeyMap, options: UseHotkeysOptions = {}): void {
  const {
    target,
    preventDefault = true,
    enableOnFormTags = false,
    ignoreRepeat = true,
    enabled = true,
  } = options;
  const hotkeysRef = useLatest(hotkeys);
  const comboKey = Object.keys(hotkeys).join('|');

  useEffect(() => {
    if (!enabled) return;
    const resolved = target === undefined ? document : resolveTarget<EventTarget>(target);
    if (!resolved) return;

    const entries = comboKey
      .split('|')
      .filter(Boolean)
      .flatMap((definition) =>
        definition.split(',').map((single) => ({
          definition,
          sequence: single
            .trim()
            .split(/\s+/)
            .map(parseCombo),
        })),
      );

    let buffer: KeyboardEvent[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const listener = (raw: Event) => {
      const event = raw as KeyboardEvent;
      if (ignoreRepeat && event.repeat) return;
      if (!enableOnFormTags && isFormTarget(event.target)) return;
      if (['shift', 'control', 'alt', 'meta'].includes(event.key.toLowerCase())) return;

      buffer = [...buffer, event].slice(-5);
      clearTimeout(timer);
      timer = setTimeout(() => {
        buffer = [];
      }, 1000);

      for (const { definition, sequence } of entries) {
        if (buffer.length < sequence.length) continue;
        const tail = buffer.slice(-sequence.length);
        if (sequence.every((combo, index) => matchesCombo(tail[index] as KeyboardEvent, combo))) {
          if (preventDefault) event.preventDefault();
          buffer = [];
          hotkeysRef.current[definition]?.(event);
          return;
        }
      }
    };

    resolved.addEventListener('keydown', listener);
    return () => {
      clearTimeout(timer);
      resolved.removeEventListener('keydown', listener);
    };
  }, [comboKey, enabled, target, preventDefault, enableOnFormTags, ignoreRepeat, hotkeysRef]);
}
