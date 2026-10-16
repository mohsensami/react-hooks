import { useCallback, useMemo, useSyncExternalStore } from 'react'

const EVENT = 'react-hooks-kit:navigate'

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener(EVENT, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(EVENT, cb)
  }
}
const getSearch = () => window.location.search

function writeParams(params: URLSearchParams, replace: boolean) {
  const qs = params.toString()
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url)
  window.dispatchEvent(new Event(EVENT))
}

/**
 * One URL query parameter as state (`?tab=settings`).
 * @example const [tab, setTab] = useQueryParam('tab', 'home')
 */
export function useQueryParam(key: string, defaultValue = '', { replace = true } = {}) {
  const search = useSyncExternalStore(subscribe, getSearch, () => '')
  const value = useMemo(() => new URLSearchParams(search).get(key) ?? defaultValue, [search, key, defaultValue])
  const set = useCallback(
    (next: string | null) => {
      const params = new URLSearchParams(window.location.search)
      if (next === null || next === '') params.delete(key)
      else params.set(key, next)
      writeParams(params, replace)
    },
    [key, replace],
  )
  return [value, set] as const
}

/**
 * All query params as an object.
 * @example const [params, setParams] = useQueryParams(); setParams({ page: 2 })
 */
export function useQueryParams({ replace = true } = {}) {
  const search = useSyncExternalStore(subscribe, getSearch, () => '')
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(search)) as Record<string, string>, [search])
  const set = useCallback(
    (patch: Record<string, string | number | boolean | null | undefined>, { reset = false } = {}) => {
      const next = reset ? new URLSearchParams() : new URLSearchParams(window.location.search)
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined || v === '') next.delete(k)
        else next.set(k, String(v))
      }
      writeParams(next, replace)
    },
    [replace],
  )
  return [params, set] as const
}
