import { useEffect, useRef } from 'react'

/** Logs which props changed between renders. Debug helper – remove in production. */
export function useWhyDidYouUpdate(name: string, props: Record<string, unknown>) {
  const prev = useRef<Record<string, unknown>>({})
  useEffect(() => {
    const changes: Record<string, { from: unknown; to: unknown }> = {}
    for (const key of new Set([...Object.keys(prev.current), ...Object.keys(props)])) {
      if (!Object.is(prev.current[key], props[key])) changes[key] = { from: prev.current[key], to: props[key] }
    }
    if (Object.keys(changes).length) console.log(`[why-did-you-update] ${name}`, changes)
    prev.current = props
  })
}
