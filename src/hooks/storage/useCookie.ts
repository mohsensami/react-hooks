import { useCallback, useSyncExternalStore } from 'react'
import { isBrowser } from '../_internal'

export interface CookieOptions {
  /** days until expiry (omit = session cookie) */
  days?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

const EVENT = 'react-hooks-kit:cookie'

export function getCookie(name: string): string | null {
  if (!isBrowser) return null
  const match = document.cookie.split('; ').find((c) => c.startsWith(encodeURIComponent(name) + '='))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}

export function setCookie(name: string, value: string, o: CookieOptions = {}) {
  let c = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${o.path ?? '/'}`
  if (o.days !== undefined) c += `; expires=${new Date(Date.now() + o.days * 864e5).toUTCString()}`
  if (o.domain) c += `; domain=${o.domain}`
  if (o.secure) c += '; secure'
  if (o.sameSite) c += `; samesite=${o.sameSite}`
  document.cookie = c
  window.dispatchEvent(new CustomEvent(EVENT, { detail: name }))
}

export function deleteCookie(name: string, o: Pick<CookieOptions, 'path' | 'domain'> = {}) {
  setCookie(name, '', { ...o, days: -1 })
}

/**
 * Read / write a cookie reactively.
 * @example const [token, setToken, removeToken] = useCookie('token')
 */
export function useCookie(name: string, defaultValue: string | null = null) {
  const subscribe = useCallback((cb: () => void) => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<string>).detail === name) cb()
    }
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [name])
  const value = useSyncExternalStore(subscribe, () => getCookie(name), () => null)
  const set = useCallback((v: string, o?: CookieOptions) => setCookie(name, v, o), [name])
  const remove = useCallback((o?: Pick<CookieOptions, 'path' | 'domain'>) => deleteCookie(name, o), [name])
  return [value ?? defaultValue, set, remove] as const
}
