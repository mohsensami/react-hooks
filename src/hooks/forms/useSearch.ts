import { useMemo, useState } from 'react'
import { useDebounce } from '../timing/useDebounce'

/**
 * Client-side search/filter over a list (case-insensitive, multi-word, debounced).
 * @example const { query, setQuery, results } = useSearch(users, { keys: ['name', 'email'], debounce: 250 })
 */
export function useSearch<T extends Record<string, unknown>>(items: T[], { keys, debounce = 200, initialQuery = '' }: { keys: (keyof T)[]; debounce?: number; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const debounced = useDebounce(query, debounce)
  const keyId = keys.map(String).join('|')
  const results = useMemo(() => {
    const words = debounced.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return items
    return items.filter((item) => {
      const haystack = keyId.split('|').map((k) => String(item[k] ?? '')).join(' ').toLowerCase()
      return words.every((w) => haystack.includes(w))
    })
  }, [items, debounced, keyId])
  return { query, setQuery, results, isSearching: query !== debounced, total: items.length }
}
