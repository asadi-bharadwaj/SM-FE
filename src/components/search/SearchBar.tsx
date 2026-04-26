import { Search, X } from 'lucide-react'
import styles from './SearchBar.module.css'

type Props = {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden>
        <Search size={18} />
      </span>
      <input
        className={styles.input}
        type="search"
        name="q"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        enterKeyHint="search"
        aria-label="Search"
      />
      {value.length > 0 && (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear"
          onClick={() => onChange('')}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
