import { useMemo } from 'react'
import { searchUsers } from '../../mocks/users'
import { ProfileResultRow } from './ProfileResultRow'
import { EmptyState } from '../common/EmptyState'
import styles from './ProfileResults.module.css'

type Props = { q: string }

export function ProfileResults({ q }: Props) {
  const list = useMemo(() => searchUsers(q), [q])
  if (q.trim() && list.length === 0) {
    return (
      <EmptyState
        title="No profiles"
        description="No creators match that search."
      />
    )
  }
  return (
    <ul className={styles.list} aria-label="Profile results">
      {list.map((u) => (
        <li key={u.id}>
          <ProfileResultRow user={u} />
        </li>
      ))}
    </ul>
  )
}
