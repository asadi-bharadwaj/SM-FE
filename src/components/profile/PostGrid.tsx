import { useIsPostLocked } from '../../hooks/useIsPostLocked'
import type { Post } from '../../types'
import { PostGridItem } from './PostGridItem'
import { EmptyState } from '../common/EmptyState'
import styles from './PostGrid.module.css'

type Props = { posts: Post[] }

export function PostGrid({ posts }: Props) {
  if (posts.length === 0) {
    return <EmptyState title="No posts yet" />
  }
  return (
    <ul className={styles.grid} aria-label="Post grid">
      {posts.map((p) => (
        <li key={p.id}>
          <PostGridItemWrapper post={p} />
        </li>
      ))}
    </ul>
  )
}

function PostGridItemWrapper({ post }: { post: Post }) {
  const locked = useIsPostLocked(post)
  return <PostGridItem post={post} locked={locked} />
}
