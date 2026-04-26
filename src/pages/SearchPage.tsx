import { useSearchQuery } from '../hooks/useSearchQuery'
import { SearchBar } from '../components/search/SearchBar'
import { SearchModeSegment } from '../components/search/SearchModeSegment'
import { SearchPageHeader } from '../components/search/SearchPageHeader'
import { ContentResults } from '../components/search/ContentResults'
import { ProfileResults } from '../components/search/ProfileResults'

export function SearchPage() {
  const { q, mode, setMode, setParams, params } = useSearchQuery()

  const onQ = (v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set('q', v)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  return (
    <SearchPageHeader>
      <SearchBar value={q} onChange={onQ} />
      <SearchModeSegment mode={mode} onChange={setMode} />
      {mode === 'content' ? <ContentResults q={q} /> : <ProfileResults q={q} />}
    </SearchPageHeader>
  )
}
