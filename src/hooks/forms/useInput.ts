import { useCallback, useState } from 'react'
import type { ChangeEvent } from 'react'

/**
 * Single input state with optional transform & validation.
 * @example const name = useInput('', { validate: v => v.length < 3 && 'Too short' }); <input {...name.bind} /> {name.error}
 */
export function useInput(
  initialValue = '',
  { transform, validate }: { transform?: (v: string) => string; validate?: (v: string) => string | false | undefined | null } = {},
) {
  const [value, setRaw] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const setValue = useCallback((v: string) => setRaw(transform ? transform(v) : v), [transform])
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValue(e.target.value), [setValue])
  const reset = useCallback(() => {
    setRaw(initialValue)
    setTouched(false)
  }, [initialValue])
  const error = validate?.(value) || undefined
  return {
    value, setValue, onChange, reset, touched, error, isValid: !error, isDirty: value !== initialValue,
    bind: { value, onChange, onBlur: () => setTouched(true) },
  }
}
