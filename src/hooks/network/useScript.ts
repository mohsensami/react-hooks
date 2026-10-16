import { useEffect, useState } from 'react'

export type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error'
const statuses = new Map<string, ScriptStatus>()

/**
 * Load an external <script> once (shared between components).
 * @example const status = useScript('https://cdn.example.com/lib.js'); if (status === 'ready') window.Lib.init()
 */
export function useScript(src: string | null, { async = true, defer = false, removeOnUnmount = false, attrs = {} as Record<string, string> } = {}): ScriptStatus {
  const [status, setStatus] = useState<ScriptStatus>(src ? statuses.get(src) ?? 'loading' : 'idle')
  useEffect(() => {
    if (!src) return setStatus('idle')
    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (script && statuses.get(src) === 'ready') return setStatus('ready')
    if (!script) {
      script = document.createElement('script')
      script.src = src
      script.async = async
      script.defer = defer
      Object.entries(attrs).forEach(([k, v]) => script!.setAttribute(k, v))
      document.body.appendChild(script)
      statuses.set(src, 'loading')
    }
    const set = (s: ScriptStatus) => () => {
      statuses.set(src, s)
      setStatus(s)
    }
    const onLoad = set('ready')
    const onError = set('error')
    script.addEventListener('load', onLoad)
    script.addEventListener('error', onError)
    return () => {
      script!.removeEventListener('load', onLoad)
      script!.removeEventListener('error', onError)
      if (removeOnUnmount) {
        script!.remove()
        statuses.delete(src)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, async, defer, removeOnUnmount])
  return status
}
