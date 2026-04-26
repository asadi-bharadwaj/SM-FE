import { useEffect, useState } from 'react'

function getMatch(query: string) {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

export function useMediaQuery(query: string): boolean {
  const [m, setM] = useState(() => getMatch(query))

  useEffect(() => {
    const mm = window.matchMedia(query)
    const fn = () => setM(mm.matches)
    fn()
    mm.addEventListener('change', fn)
    return () => mm.removeEventListener('change', fn)
  }, [query])

  return m
}
