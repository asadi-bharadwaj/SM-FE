import { timeAgo } from '../../lib/time'
import { UserLink } from '../common/UserLink'
import type { Comment } from '../../types'
import styles from './CommentItem.module.css'

type Props = { comment: any }

export function CommentItem({ comment }: Props) {
  const user = comment.user || {
    id: comment.userId,
    username: `user_${comment.userId}`,
    displayName: `User ${comment.userId}`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`
  }

  return (
    <div className={styles.root}>
      <div className={styles.text}>
        <UserLink user={user} bold>
          {user.username}
        </UserLink>{' '}
        {comment.text}
        <div className={styles.meta}>
          {timeAgo(comment.createdAt || new Date().toISOString())}
        </div>
      </div>
    </div>
  )
}
