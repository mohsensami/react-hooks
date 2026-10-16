import { useEffect } from 'react'

/** Logs mount / update / unmount of the component with its props. */
export function useLogger(name: string, ...rest: unknown[]) {
  useEffect(() => {
    console.log(`${name} mounted`, ...rest)
    return () => console.log(`${name} unmounted`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    console.log(`${name} updated`, ...rest)
  })
}
