import { useEffect, useState } from 'react'

export function useSimulatedLoading(key: string, delay = 280) {
  const [readyKey, setReadyKey] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReadyKey(key)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [delay, key])

  return readyKey !== key
}
