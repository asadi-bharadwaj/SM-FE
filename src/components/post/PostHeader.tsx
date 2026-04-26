import { MoreHorizontal } from 'lucide-react'
import { IconButton } from '../common/IconButton'
import { UserLink } from '../common/UserLink'
import { Avatar } from '../common/Avatar'
import { timeAgo } from '../../lib/time'
import type { Post } from '../../types'
import styles from './PostHeader.module.css'

type Props = {
  post: Post
  verified?: boolean
}

export function PostHeader({ post, verified }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <UserLink user={post.author} className={styles.avatarLink}>
          <Avatar src={post.author.avatarUrl} alt="" size="md" className={styles.ava} />
        </UserLink>
        <div>
          <div className={styles.nameRow}>
            <UserLink user={post.author} bold>
              {post.author.username}
            </UserLink>
            {verified ? <span className={styles.verified} aria-label="Verified">✓</span> : null}
            {post.visibility === 'tier' && post.tierId ? (
              <span className={styles.pill}>Pro</span>
            ) : null}
            <span className={styles.dot} aria-hidden>
              ·
            </span>
            <span className={styles.time}>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>
      <IconButton type="button" label="Menu">
        <MoreHorizontal size={22} />
      </IconButton>
    </div>
  )
}
