import { usePostEngagement } from '../../context/PostEngagementContext'
import { CommentItem } from './CommentItem'
import styles from './CommentList.module.css'

type Props = { postId: string; max?: number; locked?: boolean }

export function CommentList({ postId, max, locked }: Props) {
  const { comments } = usePostEngagement()
  if (locked) return null
  const list = max != null ? comments.slice(0, max) : comments
  if (list.length === 0) return null
  return (
    <ul className={styles.list} aria-label="Comments">
      {list.map((c) => (
        <li key={c.id}>
          <CommentItem comment={c} />
        </li>
      ))}
    </ul>
  )
}
