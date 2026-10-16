import { useCallback, useMemo, useSyncExternalStore } from 'react';

const EVENT = 'hooks:querychange';

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener(EVENT, cb);
  };
}
const getSearch = () => window.location.search;
const getServerSearch = () => '';

export interface SetQueryOptions {
  /** use `history.replaceState` instead of `pushState` (default false) */
  replace?: boolean;
}

function writeSearch(params: URLSearchParams, replace?: boolean) {
  const qs = params.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Read & write ONE URL query parameter (`?page=2`) without any router.
 * Setting `null` / `undefined` removes the parameter.
 *
 * @example
 * const [page, setPage] = useQueryParam('page', '1');
 * setPage('2');
 * setPage(null); // removes ?page
 */
export function useQueryParam(key: string, defaultValue = '') {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const value = new URLSearchParams(search).get(key) ?? defaultValue;
  const set = useCallback(
    (next: string | null | undefined, { replace }: SetQueryOptions = {}) => {
      const params = new URLSearchParams(window.location.search);
      if (next === null || next === undefined) params.delete(key);
      else params.set(key, next);
      writeSearch(params, replace);
    },
    [key],
  );
  return [value, set] as const;
}

/**
 * Read & write ALL URL query parameters as a plain object.
 *
 * @example
 * const [params, setParams] = useQueryParams();
 * setParams({ q: 'react', page: undefined }); // merges; undefined/null removes
 */
export function useQueryParams() {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
  const setParams = useCallback(
    (patch: Record<string, string | number | boolean | null | undefined>, { replace }: SetQueryOptions = {}) => {
      const next = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined) next.delete(k);
        else next.set(k, String(v));
      }
      writeSearch(next, replace);
    },
    [],
  );
  return [params, setParams] as const;
}
