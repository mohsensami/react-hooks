import { useEffect, useState } from 'react'

/**
 * Types `text` letter by letter.
 * @example const { displayed, done } = useTypewriter('Hello world', { speed: 60 })
 */
export function useTypewriter(text: string, { speed = 50, delay = 0, loop = false, pause = 1200 } = {}) {
  const [length, setLength] = useState(0)
  useEffect(() => {
    setLength(0)
    let interval: ReturnType<typeof setInterval>
    let restart: ReturnType<typeof setTimeout>
    const run = () => {
      let i = 0
      interval = setInterval(() => {
        i += 1
        setLength(i)
        if (i >= text.length) {
          clearInterval(interval)
          if (loop) {
            restart = setTimeout(() => {
              setLength(0)
              run()
            }, pause)
          }
        }
      }, speed)
    }
    const start = setTimeout(run, delay)
    return () => {
      clearTimeout(start)
      clearTimeout(restart)
      clearInterval(interval)
    }
  }, [text, speed, delay, loop, pause])
  return { displayed: text.slice(0, length), done: length >= text.length }
}
