import { useCallback, useEffect, useRef, useState } from 'react'

/* ---------------- Text to speech ---------------- */

/**
 * Text-to-speech (speechSynthesis).
 * @example const { speak, cancel, speaking, voices } = useSpeechSynthesis(); speak('Hello', { lang: 'en-US' })
 */
export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (!isSupported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [isSupported])

  const speak = useCallback(
    (text: string, options: { lang?: string; rate?: number; pitch?: number; volume?: number; voice?: SpeechSynthesisVoice } = {}) => {
      if (!isSupported) return
      const u = new SpeechSynthesisUtterance(text)
      Object.assign(u, options)
      u.onstart = () => setSpeaking(true)
      u.onend = () => { setSpeaking(false); setPaused(false) }
      u.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(u)
    },
    [isSupported],
  )
  const cancel = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false); setPaused(false) }, [])
  const pause = useCallback(() => { window.speechSynthesis?.pause(); setPaused(true) }, [])
  const resume = useCallback(() => { window.speechSynthesis?.resume(); setPaused(false) }, [])
  return { isSupported, speak, cancel, pause, resume, speaking, paused, voices }
}

/* ---------------- Speech to text ---------------- */

interface RecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

export interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
}

/**
 * Speech-to-text (Chrome / Edge / Safari). 
 * @example const { start, stop, transcript, listening } = useSpeechRecognition({ lang: 'fa-IR' })
 */
export function useSpeechRecognition({ lang = 'en-US', continuous = true, interimResults = true }: UseSpeechRecognitionOptions = {}) {
  const Ctor = typeof window !== 'undefined'
    ? ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => RecognitionLike) | undefined
    : undefined
  const isSupported = !!Ctor
  const rec = useRef<RecognitionLike | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(() => {
    if (!Ctor || rec.current) return
    const r = new Ctor()
    r.lang = lang
    r.continuous = continuous
    r.interimResults = interimResults
    r.onresult = (e) => {
      let finalText = ''
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) finalText += res[0].transcript
        else interimText += res[0].transcript
      }
      if (finalText) setTranscript((t) => (t ? t + ' ' : '') + finalText.trim())
      setInterim(interimText)
    }
    r.onerror = (e) => setError(e.error)
    r.onend = () => { rec.current = null; setListening(false); setInterim('') }
    rec.current = r
    setError(null)
    r.start()
    setListening(true)
  }, [Ctor, lang, continuous, interimResults])
  const stop = useCallback(() => rec.current?.stop(), [])
  const reset = useCallback(() => { setTranscript(''); setInterim('') }, [])
  useEffect(() => () => rec.current?.abort(), [])

  return { isSupported, listening, transcript, interim, error, start, stop, reset }
}
