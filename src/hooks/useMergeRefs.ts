import { useCallback } from 'react';
import type { Ref, RefCallback } from 'react';

/**
 * Merge several refs (object refs and/or callback refs) into one callback ref.
 * Useful when a component needs its own ref AND must forward the parent's ref.
 *
 * @example
 * const Input = ({ ref, ...props }: ComponentProps<'input'>) => {
 *   const innerRef = useRef<HTMLInputElement>(null);
 *   const mergedRef = useMergeRefs(ref, innerRef);
 *   return <input ref={mergedRef} {...props} />;
 * };
 */
export function useMergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback<RefCallback<T>>((node) => {
    const cleanups: Array<() => void> = [];

    for (const ref of refs) {
      if (typeof ref === 'function') {
        const cleanup = ref(node);
        cleanups.push(typeof cleanup === 'function' ? cleanup : () => ref(null));
      } else if (ref) {
        ref.current = node;
        cleanups.push(() => {
          ref.current = null;
        });
      }
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, refs);
}
