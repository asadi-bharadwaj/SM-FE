import { timeAgo } from '../../lib/time'
import { UserLink } from '../common/UserLink'
import type { Comment } from '../../types'
import styles from './CommentItem.module.css'

type Props = { comment: Comment }

export function CommentItem({ comment }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.text}>
        <UserLink user={comment.user} bold>
          {comment.user.username}
        </UserLink>{' '}
        {comment.text}
        <div className={styles.meta}>
          {timeAgo(comment.createdAt)}
        </div>
      </div>
    </div>
  )
}
