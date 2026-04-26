import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { searchPosts } from '../../mocks/posts'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { PostCard } from '../post/PostCard'
import { EmptyState } from '../common/EmptyState'
import styles from './ContentResults.module.css'

type Props = {
  q: string
}

export function ContentResults({ q }: Props) {
  const subscribedAuthorIds = useSubscriptionStore((s) => s.subscribedAuthorIds)
  const list = useMemo(
    () => searchPosts(q, new Set(subscribedAuthorIds)),
    [q, subscribedAuthorIds],
  )

  if (q.trim() && list.length === 0) {
    return (
      <EmptyState
        title="No content found"
        description="Try a different search or switch to Profiles."
      />
    )
  }

  if (!q.trim() && list.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Search or find creators in Profiles to subscribe."
        action={
          <Link to="/?mode=profiles" className={styles.cta}>
            See profiles
          </Link>
        }
      />
    )
  }

  return (
    <div className={styles.list} role="feed" aria-label="Content results">
      {list.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  )
}
