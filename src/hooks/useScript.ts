import { useEffect, useState } from 'react';

export type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Load an external script once (shared between components) and track its status.
 *
 * @example
 * const status = useScript('https://example.com/sdk.js');
 * if (status === 'ready') window.SDK.init();
 */
export function useScript(src: string | null, attributes: Partial<HTMLScriptElement> = {}): ScriptStatus {
  const [status, setStatus] = useState<ScriptStatus>(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (script?.dataset.status === 'ready') {
      setStatus('ready');
      return;
    }
    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.status = 'loading';
      Object.assign(script, attributes);
      document.body.appendChild(script);
    }
    setStatus((script.dataset.status as ScriptStatus) ?? 'loading');
    const el = script;
    const onLoad = () => {
      el.dataset.status = 'ready';
      setStatus('ready');
    };
    const onError = () => {
      el.dataset.status = 'error';
      el.remove();
      setStatus('error');
    };
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return status;
}
