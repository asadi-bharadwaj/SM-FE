import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { getMockLikersForPost } from '../../mocks/likesList'
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

import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

export function LikesModal({ postId, likeCount, onClose }: Props) {
  useLockBodyScroll(true)
  const [likers, setLikers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLikers = async () => {
      try {
        const res = await apiFetch(`/posts/engagement/${postId}/likers`)
        if (res.ok) {
          const data = await res.json()
          setLikers(data.users || [])
        }
      } catch (err) {
        console.error('Failed to fetch likers', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLikers()
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
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading...</div>
        ) : likers.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No likes yet</div>
        ) : (
          <ul className={styles.list}>
            {likers.map((u) => (
              <li key={u.id} className={styles.row}>
                <UserLink user={u} className={styles.who}>
                  <Avatar src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" size="md" />
                  <div>
                    <div className={styles.name}>{u.username}</div>
                    <div className={styles.dn}>{u.displayName}</div>
                  </div>
                </UserLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
