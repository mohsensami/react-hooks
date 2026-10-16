import type { RefObject } from 'react'

/** true when running in a browser (false during SSR). */
export const isBrowser = typeof window !== 'undefined'

export const noop = () => {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any

/** Value or updater function – same shape as React's setState argument. */
export type Setter<T> = T | ((prev: T) => T)

/** An element, a ref to an element, null or undefined. */
export type TargetLike<T> = T | RefObject<T | null> | null | undefined

/**
 * Resolves an element / ref / undefined into the real element.
 * `undefined` returns `fallback` (usually `window`), `null` returns null.
 */
export function resolveTarget<T>(target: TargetLike<T>, fallback: T | null = null): T | null {
  if (target === undefined) return fallback
  if (target === null) return null
  if (typeof target === 'object' && 'current' in (target as object)) {
    return (target as RefObject<T | null>).current
  }
  return target as T
}

export function resolveSetter<T>(next: Setter<T>, prev: T): T {
  return typeof next === 'function' ? (next as (p: T) => T)(prev) : next
}

/** Deep equality for primitives, arrays, plain objects, Date, RegExp, Map and Set. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString()
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k))) return false
    return true
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    for (const v of a) if (!b.has(v)) return false
    return true
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false
  }
  return true
}
