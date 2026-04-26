import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type SearchMode = 'content' | 'profiles'

export function useSearchQuery() {
  const [params, setParams] = useSearchParams()

  const q = useMemo(() => params.get('q') ?? '', [params])
  const mode = useMemo((): SearchMode => {
    const m = params.get('mode')
    if (m === 'profiles' || m === 'content') return m
    return 'content'
  }, [params])

  const setQ = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params)
      if (value) next.set('q', value)
      else next.delete('q')
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  const setMode = useCallback(
    (m: SearchMode) => {
      const next = new URLSearchParams(params)
      next.set('mode', m)
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  return { q, setQ, mode, setMode, params, setParams }
}
