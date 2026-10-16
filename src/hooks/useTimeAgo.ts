import { useNow } from './useNow';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNITS: ReadonlyArray<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * DAY },
  { unit: 'month', ms: 30 * DAY },
  { unit: 'week', ms: 7 * DAY },
  { unit: 'day', ms: DAY },
  { unit: 'hour', ms: HOUR },
  { unit: 'minute', ms: MINUTE },
  { unit: 'second', ms: 1000 },
];

export interface TimeAgoOptions {
  /** BCP-47 locale, e.g. 'fa', 'en' (default: browser language) */
  locale?: string;
  /** 'auto' -> "yesterday", 'always' -> "1 day ago" */
  numeric?: 'auto' | 'always';
}

/** Pure helper: "3 minutes ago", "in 2 days", "yesterday" ... */
export function formatTimeAgo(
  date: Date | number | string,
  now: number = Date.now(),
  options: TimeAgoOptions = {},
): string {
  const { locale, numeric = 'auto' } = options;
  const diff = new Date(date).getTime() - now;
  const abs = Math.abs(diff);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric });

  for (const { unit, ms } of UNITS) {
    if (abs >= ms || unit === 'second') {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return formatter.format(0, 'second');
}

export interface UseTimeAgoOptions extends TimeAgoOptions {
  /** How often to refresh the text in ms (default: 30000). `null` = never. */
  updateInterval?: number | null;
}

/**
 * Live relative time ("5 minutes ago") using `Intl.RelativeTimeFormat`.
 *
 * @example
 * const text = useTimeAgo(post.createdAt, { locale: 'fa' });
 */
export function useTimeAgo(
  date: Date | number | string,
  options: UseTimeAgoOptions = {},
): string {
  const { updateInterval = 30_000, ...formatOptions } = options;
  const now = useNow(updateInterval);
  return formatTimeAgo(date, now.getTime(), formatOptions);
}
