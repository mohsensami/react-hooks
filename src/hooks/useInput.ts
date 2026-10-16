import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

export interface UseInputReturn {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  reset: () => void;
  isDirty: boolean;
  /** Spread on an input: `<input {...input.bind} />` */
  bind: {
    value: string;
    onChange: UseInputReturn['onChange'];
  };
}

/**
 * Controlled text input helper.
 *
 * @example
 * const name = useInput('');
 * <input {...name.bind} />
 */
export function useInput(initialValue = ''): UseInputReturn {
  const [initial] = useState(initialValue);
  const [value, setValue] = useState(initial);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValue(event.target.value),
    [],
  );
  const reset = useCallback(() => setValue(initial), [initial]);

  return useMemo(
    () => ({
      value,
      setValue,
      onChange,
      reset,
      isDirty: value !== initial,
      bind: { value, onChange },
    }),
    [value, onChange, reset, initial],
  );
}
