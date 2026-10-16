import { useCallback, useState } from 'react'
import { resolveSetter } from '../_internal'
import type { Setter } from '../_internal'
import { useLatest } from '../utils/useLatest'

export interface UseControllableStateProps<T> {
  /** Controlled value – when defined the component is controlled. */
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}

/**
 * Build components that work both controlled (`value`) and uncontrolled (`defaultValue`).
 * @example const [checked, setChecked] = useControllableState({ value: props.checked, defaultValue: false, onChange: props.onChange })
 */
export function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateProps<T>) {
  const isControlled = value !== undefined
  const [inner, setInner] = useState<T>(defaultValue)
  const current = (isControlled ? value : inner) as T
  const currentRef = useLatest(current)
  const onChangeRef = useLatest(onChange)

  const set = useCallback(
    (next: Setter<T>) => {
      const resolved = resolveSetter(next, currentRef.current)
      if (!isControlled) setInner(resolved)
      if (!Object.is(resolved, currentRef.current)) onChangeRef.current?.(resolved)
    },
    [isControlled, currentRef, onChangeRef],
  )
  return [current, set] as const
}
