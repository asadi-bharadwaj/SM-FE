import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { Post } from '../../types'
import styles from './PostGridItem.module.css'

type Props = { post: Post; locked: boolean; contextPosts?: Post[] }

export function PostGridItem({ post, locked, contextPosts }: Props) {
  return (
    <Link
      to={`/p/${post.id}`}
      state={{ contextPosts }}
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
