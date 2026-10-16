import { useCallback, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'

export type FormErrors<T> = Partial<Record<keyof T, string>>
export type FormTouched<T> = Partial<Record<keyof T, boolean>>

export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T
  /** return an object of { field: 'error message' } (empty object = valid). May be async. */
  validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>
  /** or validators per field: return a message or undefined */
  validators?: { [K in keyof T]?: (value: T[K], values: T) => string | undefined | false | null }
  onSubmit?: (values: T, helpers: { reset: () => void; setErrors: (e: FormErrors<T>) => void }) => void | Promise<void>
  /** when to validate. default 'change' */
  validateOn?: 'change' | 'blur' | 'submit'
}

/**
 * Complete form state: values, errors, touched, dirty, submit.
 * @example
 * const form = useForm({ initialValues: { email: '', age: 0 }, validators: { email: v => !v.includes('@') && 'Invalid' }, onSubmit: save })
 * <input {...form.getFieldProps('email')} />  {form.errors.email}
 * <form onSubmit={form.handleSubmit}>
 */
export function useForm<T extends Record<string, unknown>>({ initialValues, validate, validators, onSubmit, validateOn = 'change' }: UseFormOptions<T>) {
  const initialRef = useRef(initialValues)
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [touched, setTouchedState] = useState<FormTouched<T>>({})
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  const valuesRef = useRef(values)
  valuesRef.current = values
  const cfg = useRef({ validate, validators, onSubmit })
  cfg.current = { validate, validators, onSubmit }

  const runValidation = useCallback(async (vals: T): Promise<FormErrors<T>> => {
    const result = { ...(cfg.current.validate ? await cfg.current.validate(vals) : {}) } as FormErrors<T>
    const v = cfg.current.validators
    if (v) {
      for (const key of Object.keys(v) as (keyof T)[]) {
        if (result[key]) continue
        const msg = v[key]?.(vals[key], vals)
        if (msg) result[key] = msg
      }
    }
    return result
  }, [])

  const validateForm = useCallback(async () => {
    const e = await runValidation(valuesRef.current)
    setErrors(e)
    return e
  }, [runValidation])

  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K], shouldValidate = validateOn === 'change') => {
      const next = { ...valuesRef.current, [name]: value }
      valuesRef.current = next
      setValuesState(next)
      if (shouldValidate) void runValidation(next).then(setErrors)
    },
    [runValidation, validateOn],
  )
  const setValues = useCallback((v: Partial<T>) => {
    const next = { ...valuesRef.current, ...v }
    valuesRef.current = next
    setValuesState(next)
  }, [])
  const setFieldError = useCallback((name: keyof T, message?: string) => setErrors((e) => ({ ...e, [name]: message }) as FormErrors<T>), [])
  const setFieldTouched = useCallback((name: keyof T, isTouched = true) => setTouchedState((t) => ({ ...t, [name]: isTouched })), [])

  const readValue = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): unknown => {
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') return el.checked
      if (el.type === 'number' || el.type === 'range') return el.value === '' ? '' : Number(el.value)
      if (el.type === 'file') return el.files
    }
    return el.value
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(e.target.name as keyof T, readValue(e.target) as T[keyof T])
    },
    [setValue],
  )
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldTouched(e.target.name as keyof T)
      if (validateOn !== 'submit') void validateForm()
    },
    [setFieldTouched, validateForm, validateOn],
  )

  const reset = useCallback((next?: T) => {
    const v = next ?? initialRef.current
    valuesRef.current = v
    setValuesState(v)
    setErrors({})
    setTouchedState({})
    setSubmitCount(0)
  }, [])

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault()
      setSubmitCount((c) => c + 1)
      setTouchedState(Object.fromEntries(Object.keys(valuesRef.current).map((k) => [k, true])) as FormTouched<T>)
      const errs = await validateForm()
      if (Object.keys(errs).length) return
      setSubmitting(true)
      try {
        await cfg.current.onSubmit?.(valuesRef.current, { reset, setErrors })
      } finally {
        setSubmitting(false)
      }
    },
    [validateForm, reset],
  )

  /** Spread on an input: `<input {...getFieldProps('email')} />` (checkbox: pass `{ type: 'checkbox' }`). */
  const getFieldProps = useCallback(
    <K extends keyof T>(name: K, { type }: { type?: 'checkbox' } = {}) => ({
      name: name as string,
      onChange: handleChange,
      onBlur: handleBlur,
      ...(type === 'checkbox' ? { checked: Boolean(values[name]) } : { value: (values[name] ?? '') as string | number }),
    }),
    [handleChange, handleBlur, values],
  )

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialRef.current), [values])
  const isValid = Object.values(errors).every((e) => !e)

  return {
    values, errors, touched, isSubmitting, submitCount, dirty, isValid,
    setValue, setValues, setFieldError, setFieldTouched, setErrors,
    handleChange, handleBlur, handleSubmit, getFieldProps, validate: validateForm, reset,
  }
}
