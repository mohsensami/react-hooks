import { useCallback, useMemo, useState } from 'react'

/**
 * Boolean state with named helpers.
 * @example const { value, setTrue, setFalse, toggle } = useBoolean()
 */
export function useBoolean(initialValue = false) {
  const [value, set] = useState(initialValue)
  const actions = useMemo(
    () => ({
      set,
      setTrue: () => set(true),
      setFalse: () => set(false),
      toggle: () => set((v) => !v),
    }),
    [],
  )
  return { value, ...actions }
}

export const useDisclosure = (initial = false) => {
  const { value, setTrue, setFalse, toggle } = useBoolean(initial)
  const open = useCallback(setTrue, [setTrue])
  const close = useCallback(setFalse, [setFalse])
  return { isOpen: value, open, close, toggle }
}
