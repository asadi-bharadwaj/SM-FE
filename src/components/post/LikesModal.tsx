import { useEffect, useState } from 'react'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { fetchPostLikers } from '../../api/engagementApi'
import type { PublicProfile } from '../../types'
import { Avatar } from '../common/Avatar'
import { IconButton } from '../common/IconButton'
import { X } from 'lucide-react'
import { UserLink } from '../common/UserLink'
import styles from './LikesModal.module.css'

type Props = {
  postId: string
  likeCount: number
  onClose: () => void
}

export function LikesModal({ postId, likeCount, onClose }: Props) {
  useLockBodyScroll(true)
  const [likers, setLikers] = useState<PublicProfile[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    fetchPostLikers(postId)
      .then((users) => {
        if (!cancelled) {
          setLikers(users)
          setLoadError(null)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLikers([])
          setLoadError(e instanceof Error ? e.message : 'Could not load likes.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Likes"
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && e.stopPropagation()}
        role="document"
      >
        <div className={styles.header}>
          <span className={styles.hTitle}>Likes</span>
          <IconButton
            className={styles.close}
            type="button"
            label="Close"
            onClick={onClose}
          >
            <X size={22} />
          </IconButton>
        </div>
        {loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : null}
        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : null}
        <ul className={styles.list}>
          {likers.map((u) => (
            <li key={u.id} className={styles.row}>
              <UserLink user={u} className={styles.who}>
                <Avatar src={u.avatarUrl} alt="" size="md" />
                <div>
                  <div className={styles.name}>{u.username}</div>
                  <div className={styles.dn}>{u.displayName}</div>
                </div>
              </UserLink>
            </li>
          ))}
        </ul>
        {!loading && !loadError && likeCount === 0 ? (
          <p className={styles.muted}>No likes yet.</p>
        ) : null}
      </div>
    </div>
  )
}
