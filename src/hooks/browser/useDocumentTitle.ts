import { useEffect, useRef } from 'react'

/**
 * Sets `document.title`.
 * @example useDocumentTitle(`(${unread}) Inbox`)
 */
export function useDocumentTitle(title: string, { restoreOnUnmount = true } = {}) {
  const original = useRef(typeof document !== 'undefined' ? document.title : '')
  useEffect(() => {
    document.title = title
  }, [title])
  useEffect(() => {
    const prev = original.current
    return () => {
      if (restoreOnUnmount) document.title = prev
    }
  }, [restoreOnUnmount])
}
