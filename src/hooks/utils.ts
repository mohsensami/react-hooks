import type { RefObject } from 'react';

/** `true` when running in a browser (false during SSR / Node). */
export const isBrowser: boolean =
  typeof window !== 'undefined' && typeof document !== 'undefined';

/** A function that does nothing. */
export const noop = (): void => {};

/** Promise based `setTimeout`. */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Clamp a number between `min` and `max`. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Convert anything thrown into a real `Error` instance. */
export const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(typeof value === 'string' ? value : String(value));

/**
 * Structural (deep) equality. Supports primitives, arrays, plain objects,
 * Date, RegExp, Map and Set. Circular references are NOT supported.
 */
export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !isDeepEqual(value, b.get(key))) return false;
    }
    return true;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const value of a) {
      if (!b.has(value)) return false;
    }
    return true;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isDeepEqual(item, b[index]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      isDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

/** Anything that can point at a DOM target: the target itself, a ref to it, or null. */
export type TargetLike<T extends EventTarget = EventTarget> =
  | T
  | RefObject<T | null>
  | null
  | undefined;

/** Resolve a {@link TargetLike} to the real target (or `null`). */
export function resolveTarget<T extends EventTarget>(target: TargetLike<T>): T | null {
  if (target === null || target === undefined) return null;
  if (typeof EventTarget !== 'undefined' && target instanceof EventTarget) return target as T;
  if (typeof target === 'object' && 'current' in target) {
    return (target as RefObject<T | null>).current;
  }
  return target as T;
}

/** Any function type (used for generic callback hooks). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;
