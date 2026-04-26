import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { Post } from '../../types'
import styles from './PostGridItem.module.css'

type Props = { post: Post; locked: boolean }

export function PostGridItem({ post, locked }: Props) {
  return (
    <Link
      to={`/p/${post.id}`}
      className={styles.cell}
      style={{ backgroundImage: `url(${post.mediaUrl})` }}
    >
      {locked && (
        <span className={styles.shade}>
          <Lock size={22} aria-hidden />
        </span>
      )}
    </Link>
  )
}
