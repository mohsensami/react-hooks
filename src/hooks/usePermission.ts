import { useEffect, useState } from 'react';

export type PermissionStateValue = PermissionState | 'unsupported' | 'unknown';

/**
 * Observe a browser Permission (`geolocation`, `notifications`, `camera`, `microphone`, `clipboard-read` ...).
 *
 * @example
 * const state = usePermission('notifications'); // 'granted' | 'denied' | 'prompt' | 'unsupported'
 */
export function usePermission(name: string): PermissionStateValue {
  const [state, setState] = useState<PermissionStateValue>('unknown');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      setState('unsupported');
      return;
    }
    let status: PermissionStatus | undefined;
    let cancelled = false;
    const onChange = () => status && setState(status.state);
    navigator.permissions
      .query({ name: name as PermissionName })
      .then((s) => {
        if (cancelled) return;
        status = s;
        setState(s.state);
        s.addEventListener('change', onChange);
      })
      .catch(() => !cancelled && setState('unsupported'));
    return () => {
      cancelled = true;
      status?.removeEventListener('change', onChange);
    };
  }, [name]);

  return state;
}
