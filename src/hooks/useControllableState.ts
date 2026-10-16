import { useCallback, useState } from 'react';
import type { SetStateAction } from 'react';
import { useLatest } from './useLatest';

export interface UseControllableStateOptions<T> {
  /** Controlled value. When `undefined` the hook is uncontrolled. */
  value?: T;
  /** Initial value for the uncontrolled mode */
  defaultValue?: T;
  /** Called whenever the value changes (in both modes) */
  onChange?: (value: T) => void;
}

/**
 * Build components that work both **controlled** (`value` + `onChange`) and
 * **uncontrolled** (`defaultValue`) — the pattern used by every good UI kit.
 * (The value itself must not be `undefined`, since `undefined` means "uncontrolled".)
 *
 * @example
 * function Switch(props: { checked?: boolean; defaultChecked?: boolean; onChange?: (v: boolean) => void }) {
 *   const [checked, setChecked] = useControllableState({
 *     value: props.checked, defaultValue: props.defaultChecked ?? false, onChange: props.onChange,
 *   });
 * }
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): [T, (value: SetStateAction<T>) => void] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T | undefined>(defaultValue);

  const current = (isControlled ? value : internal) as T;
  const currentRef = useLatest(current);
  const onChangeRef = useLatest(onChange);

  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(currentRef.current) : next;
      if (!isControlled) setInternal(resolved);
      if (!Object.is(resolved, currentRef.current)) onChangeRef.current?.(resolved);
    },
    [isControlled, currentRef, onChangeRef],
  );

  return [current, setValue];
}
