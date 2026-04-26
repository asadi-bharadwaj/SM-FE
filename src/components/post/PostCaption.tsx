import { useState } from 'react'
import { UserLink } from '../common/UserLink'
import { usePostEngagement } from '../../hooks/usePostEngagement'
import type { Post } from '../../types'
import { cn } from '../../lib/cn'
import styles from './PostCaption.module.css'

type Props = {
  post: Post
  showCommentCta?: boolean
  locked: boolean
}

export function PostCaption({ post, showCommentCta, locked }: Props) {
  const { comments } = usePostEngagement(post.id)
  const [open, setOpen] = useState(false)
  const over100 = post.caption.length > 100

  return (
    <div className={styles.wrap}>
      {locked ? (
        <p className={styles.lockedText}>This content is for subscribers only.</p>
      ) : (
        <p className={styles.caption}>
          <UserLink user={post.author} className={styles.strong} bold>
            {post.author.username}
          </UserLink>{' '}
          <span
            className={cn(over100 && !open && styles.ellipsis)}
          >
            {open || !over100 ? post.caption : `${post.caption.slice(0, 100)}...`}
          </span>
          {over100 && !open ? (
            <button
              type="button"
              className={styles.more}
              onClick={() => setOpen(true)}
            >
              more
            </button>
          ) : null}
        </p>
      )}
      {showCommentCta && !locked && comments.length > 0 && (
        <p className={styles.viewAll}>View all {comments.length} comments</p>
      )}
    </div>
  )
}
