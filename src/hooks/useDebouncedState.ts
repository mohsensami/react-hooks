import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useDebounce } from './useDebounce';

/**
 * State + its debounced twin. Typical for search inputs:
 * bind the input to `value`, fire requests with `debouncedValue`.
 *
 * @example
 * const [query, debouncedQuery, setQuery] = useDebouncedState('', 400);
 */
export function useDebouncedState<T>(
  initialValue: T | (() => T),
  delay = 500,
): [value: T, debouncedValue: T, setValue: Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);
  return [value, debouncedValue, setValue];
}
