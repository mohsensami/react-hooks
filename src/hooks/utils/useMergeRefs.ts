import { useCallback } from 'react'
import type { Ref, RefObject } from 'react'

/** Merges several refs (object or callback) into one callback ref. */
export function useMergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as RefObject<T | null>).current = node
    }
  }, refs)
}
