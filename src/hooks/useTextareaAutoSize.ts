import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Auto-grow a `<textarea>` to fit its content.
 *
 * @example
 * const ref = useRef<HTMLTextAreaElement>(null);
 * useTextareaAutoSize(ref, value, { maxRows: 8 });
 * <textarea ref={ref} value={value} onChange={...} />
 */
export function useTextareaAutoSize(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  { maxRows }: { maxRows?: number } = {},
): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    let height = el.scrollHeight;
    if (maxRows) {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
      height = Math.min(height, lh * maxRows);
    }
    el.style.height = `${height}px`;
  }, [ref, value, maxRows]);
}
