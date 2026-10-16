import { useCallback, useSyncExternalStore } from 'react';
import { isBrowser } from './utils';

export interface CookieOptions {
  /** Expire after N days */
  days?: number;
  /** Max age in seconds */
  maxAge?: number;
  expires?: Date;
  /** Default: '/' */
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

const SYNC_EVENT = 'react-hooks-kit:cookie';

/** Read a cookie (decoded) or `null`. */
export function getCookie(name: string): string | null {
  if (!isBrowser) return null;
  const encodedName = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(encodedName)) {
      try {
        return decodeURIComponent(part.slice(encodedName.length));
      } catch {
        return part.slice(encodedName.length);
      }
    }
  }
  return null;
}

/** Write a cookie. */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (!isBrowser) return;
  const { days, maxAge, expires, path = '/', domain, secure, sameSite = 'lax' } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`;
  if (days !== undefined) {
    cookie += `; expires=${new Date(Date.now() + days * 86_400_000).toUTCString()}`;
  } else if (expires) {
    cookie += `; expires=${expires.toUTCString()}`;
  }
  if (maxAge !== undefined) cookie += `; max-age=${maxAge}`;
  if (domain) cookie += `; domain=${domain}`;
  if (secure) cookie += '; secure';
  cookie += `; samesite=${sameSite}`;

  document.cookie = cookie;
  window.dispatchEvent(new Event(SYNC_EVENT));
}

/** Delete a cookie (path / domain must match the ones used to create it). */
export function removeCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  if (!isBrowser) return;
  const { path = '/', domain } = options;
  document.cookie = `${encodeURIComponent(name)}=; path=${path}${
    domain ? `; domain=${domain}` : ''
  }; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  window.dispatchEvent(new Event(SYNC_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(SYNC_EVENT, callback);
  window.addEventListener('focus', callback); // cookies may change in other tabs
  return () => {
    window.removeEventListener(SYNC_EVENT, callback);
    window.removeEventListener('focus', callback);
  };
}

/**
 * Reactive cookie.
 *
 * @example
 * const [token, setToken, removeToken] = useCookie('token');
 * setToken('abc', { days: 7, secure: true });
 */
export function useCookie(
  name: string,
  defaultValue: string | null = null,
  defaultOptions: CookieOptions = {},
): [
  value: string | null,
  set: (value: string, options?: CookieOptions) => void,
  remove: () => void,
] {
  const stored = useSyncExternalStore(
    subscribe,
    () => getCookie(name),
    () => null,
  );

  const set = useCallback(
    (value: string, options?: CookieOptions) => setCookie(name, value, { ...defaultOptions, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, JSON.stringify(defaultOptions)],
  );

  const remove = useCallback(
    () => removeCookie(name, { path: defaultOptions.path, domain: defaultOptions.domain }),
    [name, defaultOptions.path, defaultOptions.domain],
  );

  return [stored ?? defaultValue, set, remove];
}
