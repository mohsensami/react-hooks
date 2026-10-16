import { useMemo } from 'react'
import { useNow } from './useNow'

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
]

/**
 * "3 minutes ago" / "in 2 hours" – re-computed automatically.
 * @example const text = useRelativeTime(post.createdAt, { locale: 'fa' })
 */
export function useRelativeTime(
  date: Date | number | string,
  { locale, updateInterval = 30000 }: { locale?: string; updateInterval?: number | null } = {},
): string {
  const now = useNow(updateInterval)
  return useMemo(() => {
    const diff = (new Date(date).getTime() - now.getTime()) / 1000
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    for (const [unit, seconds] of UNITS) {
      if (Math.abs(diff) >= seconds || unit === 'second') return rtf.format(Math.round(diff / seconds), unit)
    }
    return ''
  }, [date, now, locale])
}
