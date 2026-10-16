import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { isDeepEqual } from './utils';
import { useIsMounted } from './useIsMounted';

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

/** Return an error message when invalid, or nothing when valid. */
export type FieldValidator<T, K extends keyof T> = (
  value: T[K],
  values: T,
) => string | null | undefined | false | void;

export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  /** Per-field validators */
  validators?: { [K in keyof T]?: FieldValidator<T, K> };
  /** Whole-form validation (cross-field rules). Return an object of errors. */
  validate?: (values: T) => FormErrors<T>;
  /** Called with valid values after `handleSubmit` */
  onSubmit?: (values: T, helpers: { reset: () => void }) => void | Promise<void>;
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  /** Errors to display (only for touched fields, or every field after a submit attempt) */
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
  /** Props for `<input>`, `<textarea>`, `<select>` */
  register: <K extends keyof T & string>(
    name: K,
  ) => {
    name: K;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
  /** Props for `<input type="checkbox">` */
  registerCheckbox: <K extends keyof T & string>(
    name: K,
  ) => {
    name: K;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (patch: Partial<T>) => void;
  setFieldTouched: (name: keyof T, touched?: boolean) => void;
  /** Set a manual (e.g. server side) error. Cleared automatically when the field changes. */
  setFieldError: (name: keyof T, message: string | undefined) => void;
  reset: (nextInitialValues?: T) => void;
}

/**
 * A small, dependency-free form manager with sync validation.
 *
 * @example
 * const form = useForm({
 *   initialValues: { email: '', agree: false },
 *   validators: { email: (v) => (!v.includes('@') ? 'Invalid email' : undefined) },
 *   onSubmit: async (values) => { await api.send(values); },
 * });
 * <form onSubmit={form.handleSubmit}>
 *   <input {...form.register('email')} />
 *   {form.errors.email}
 * </form>
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>,
): UseFormReturn<T> {
  const { validators, validate, onSubmit } = options;
  const isMounted = useIsMounted();
  const [initialValues, setInitialValues] = useState<T>(options.initialValues);
  const [values, setValuesState] = useState<T>(options.initialValues);
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [manualErrors, setManualErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const computedErrors = useMemo<FormErrors<T>>(() => {
    const result: FormErrors<T> = {};
    if (validators) {
      for (const key of Object.keys(validators) as Array<keyof T>) {
        const validator = validators[key] as FieldValidator<T, keyof T> | undefined;
        const message = validator?.(values[key], values);
        if (message) result[key] = message;
      }
    }
    if (validate) Object.assign(result, validate(values));
    return result;
  }, [values, validators, validate]);

  const allErrors = useMemo<FormErrors<T>>(
    () => ({ ...computedErrors, ...manualErrors }),
    [computedErrors, manualErrors],
  );

  const errors = useMemo<FormErrors<T>>(() => {
    const visible: FormErrors<T> = {};
    for (const key of Object.keys(allErrors) as Array<keyof T>) {
      if (submitCount > 0 || touched[key]) visible[key] = allErrors[key];
    }
    return visible;
  }, [allErrors, touched, submitCount]);

  const isValid = Object.keys(allErrors).length === 0;
  const isDirty = !isDeepEqual(values, initialValues);

  const setFieldValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    setManualErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setValues = useCallback((patch: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...patch }));
    setManualErrors({});
  }, []);

  const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  const setFieldError = useCallback((name: keyof T, message: string | undefined) => {
    setManualErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      const name = target.name as keyof T;
      let value: unknown = target.value;
      if (target instanceof HTMLInputElement) {
        if (target.type === 'checkbox') value = target.checked;
        else if (target.type === 'number' || target.type === 'range') {
          value = target.value === '' ? '' : Number(target.value);
        }
      }
      setFieldValue(name, value as T[keyof T]);
    },
    [setFieldValue],
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldTouched(e.target.name as keyof T, true);
    },
    [setFieldTouched],
  );

  const reset = useCallback(
    (nextInitialValues?: T) => {
      const base = nextInitialValues ?? initialValues;
      setInitialValues(base);
      setValuesState(base);
      setTouched({});
      setManualErrors({});
      setSubmitCount(0);
      setIsSubmitting(false);
    },
    [initialValues],
  );

  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      setSubmitCount((c) => c + 1);
      setTouched(
        Object.keys(values).reduce<FormTouched<T>>((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {}),
      );

      if (Object.keys(allErrors).length > 0) return;

      setIsSubmitting(true);
      try {
        await onSubmit?.(values, { reset: () => reset() });
      } finally {
        if (isMounted()) setIsSubmitting(false);
      }
    },
    [values, allErrors, onSubmit, reset, isMounted],
  );

  const register = useCallback(
    <K extends keyof T & string>(name: K) => ({
      name,
      value: (values[name] ?? '') as string | number,
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur],
  );

  const registerCheckbox = useCallback(
    <K extends keyof T & string>(name: K) => ({
      name,
      checked: Boolean(values[name]),
      onChange: handleChange as (e: ChangeEvent<HTMLInputElement>) => void,
      onBlur: handleBlur as (e: FocusEvent<HTMLInputElement>) => void,
    }),
    [values, handleChange, handleBlur],
  );

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    submitCount,
    register,
    registerCheckbox,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
    setFieldTouched,
    setFieldError,
    reset,
  };
}
