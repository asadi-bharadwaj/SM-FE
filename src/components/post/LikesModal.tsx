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

export function LikesModal({ postId, likeCount, onClose }: Props) {
  useLockBodyScroll(true)
  const likers = getMockLikersForPost(postId, Math.min(likeCount, 20))

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
      </div>
    </div>
  )
}
