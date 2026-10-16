import { useCallback, useState } from 'react';

/**
 * Web Notifications API: ask permission and show notifications.
 *
 * @example
 * const { permission, requestPermission, notify } = useNotification();
 * await requestPermission();
 * notify('New message', { body: 'Hello!' });
 */
export function useNotification() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    isSupported ? Notification.permission : 'unsupported',
  );

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'unsupported' as const;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const notify = useCallback(
    (title: string, options?: NotificationOptions): Notification | null => {
      if (!isSupported || Notification.permission !== 'granted') return null;
      return new Notification(title, options);
    },
    [isSupported],
  );

  return { isSupported, permission, requestPermission, notify };
}
