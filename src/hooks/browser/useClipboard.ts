import { useCallback, useEffect, useRef, useState } from 'react'

function legacyCopy(text: string) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;opacity:0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  ta.remove()
  if (!ok) throw new Error('Copy command was rejected')
}

/**
 * Copy / paste text. `copied` is true for `timeout` ms after copying.
 * @example const { copy, copied } = useClipboard(); <button onClick={() => copy('hello')}>{copied ? 'Copied!' : 'Copy'}</button>
 */
export function useClipboard({ timeout = 2000 } = {}) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isSupported = typeof navigator !== 'undefined' && !!navigator.clipboard

  const copy = useCallback(
    async (value: string) => {
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value)
        else legacyCopy(value)
        setText(value)
        setError(null)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), timeout)
        return true
      } catch (e) {
        setError(e as Error)
        setCopied(false)
        return false
      }
    },
    [timeout],
  )
  const paste = useCallback(async () => {
    try {
      const value = await navigator.clipboard.readText()
      setText(value)
      return value
    } catch (e) {
      setError(e as Error)
      return null
    }
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])

  return { copy, paste, text, copied, error, isSupported }
}
