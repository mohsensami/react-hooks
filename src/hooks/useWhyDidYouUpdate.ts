import { useEffect, useRef } from 'react';

export interface PropChange {
  from: unknown;
  to: unknown;
}

/**
 * Debug helper: logs to the console which props changed between renders.
 *
 * @example
 * function Card(props: CardProps) {
 *   useWhyDidYouUpdate('Card', props);
 * }
 */
export function useWhyDidYouUpdate<P extends Record<string, unknown>>(
  name: string,
  props: P,
): Record<string, PropChange> {
  const previous = useRef<P | undefined>(undefined);
  const changes = useRef<Record<string, PropChange>>({});

  useEffect(() => {
    if (previous.current) {
      const keys = new Set([...Object.keys(previous.current), ...Object.keys(props)]);
      const next: Record<string, PropChange> = {};

      keys.forEach((key) => {
        if (!Object.is(previous.current?.[key], props[key])) {
          next[key] = { from: previous.current?.[key], to: props[key] };
        }
      });

      changes.current = next;
      if (Object.keys(next).length > 0) {
        console.log('[why-did-you-update]', name, next);
      }
    }
    previous.current = props;
  });

  return changes.current;
}
