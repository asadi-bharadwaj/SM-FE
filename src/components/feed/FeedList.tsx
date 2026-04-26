import { getFeedPosts } from '../../mocks/posts'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { PostCard } from '../post/PostCard'
import { EmptyState } from '../common/EmptyState'
import { Link } from 'react-router-dom'
import styles from './FeedList.module.css'
import { CURRENT_USER_ID } from '../../mocks/users'
import { useMemo } from 'react'

export function FeedList() {
  const set = useSubscriptionStore((s) => s.subscribedAuthorIds)
  const posts = useMemo(
    () => getFeedPosts(CURRENT_USER_ID, new Set(set)),
    [set],
  )
  if (posts.length === 0) {
    return (
      <div className={styles.wrap}>
        <EmptyState
          title="Your feed is empty"
          description="Subscribe to creators to see new posts. Search on Home."
          action={
            <Link to="/" className={styles.cta}>
              Go to search
            </Link>
          }
        />
      </div>
    )
  }
  return (
    <div className={styles.list}>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  )
}
