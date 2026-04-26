import type { SearchMode } from '../../hooks/useSearchQuery'
import { cn } from '../../lib/cn'
import styles from './SearchModeSegment.module.css'

type Props = {
  mode: SearchMode
  onChange: (m: SearchMode) => void
}

export function SearchModeSegment({ mode, onChange }: Props) {
  return (
    <div className={styles.rail} role="tablist" aria-label="Search mode">
      <button
        className={cn(styles.tab, mode === 'content' && styles.active)}
        onClick={() => onChange('content')}
        type="button"
        role="tab"
        aria-selected={mode === 'content'}
        id="tab-content"
      >
        Content
      </button>
      <button
        className={cn(styles.tab, mode === 'profiles' && styles.active)}
        onClick={() => onChange('profiles')}
        type="button"
        role="tab"
        aria-selected={mode === 'profiles'}
        id="tab-profiles"
      >
        Profiles
      </button>
    </div>
  )
}
