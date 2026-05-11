import { useEffect, useState } from 'react'
import { PostCard } from '../post/PostCard'
import { EmptyState } from '../common/EmptyState'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { mapContentServicePost } from '../../lib/contentPost'
import type { Post } from '../../types'
import styles from './FeedList.module.css'

const API = 'http://localhost:8081'

type Props = {
  onBrowseProfiles?: () => void
}

export function SubscribedCreatorsFeed({ onBrowseProfiles }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = localStorage.getItem('userId')

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await useSubscriptionStore.getState().loadSubscriptions(userId)
        const creatorIds = Array.from(useSubscriptionStore.getState().subscribedAuthorIds)
          .map((id) => Number(id))
          .filter((n) => Number.isFinite(n))

        if (creatorIds.length === 0) {
          if (!cancelled) {
            setPosts([])
            setLoading(false)
          }
          return
        }

        const usersRes = await fetch(`${API}/users/all`)
        const allUsers = usersRes.ok ? await usersRes.json() : []

        const postArrays = await Promise.all(
          creatorIds.map(async (cid) => {
            const r = await fetch(`${API}/users/${cid}/posts`)
            if (!r.ok) return []
            const data = await r.json()
            const raw: Record<string, unknown>[] = Array.isArray(data) ? data : []
            const u = allUsers.find(
              (x: { authUserId?: number; id?: string }) =>
                Number(x.authUserId) === cid || Number(x.id) === cid
            )
            const fb = {
              id: String(cid),
              username: String(u?.username ?? `user${cid}`),
              displayName: String(u?.displayName ?? u?.username ?? `User ${cid}`),
              avatarUrl: String(
                u?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${cid}`
              ),
            }
            return raw.map((dto) => mapContentServicePost(dto, fb))
          })
        )

        const merged = postArrays.flat()
        merged.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        if (!cancelled) {
          setPosts(merged)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load feed')
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  if (!userId) {
    return (
      <div className={styles.wrap}>
        <EmptyState
          title="Sign in to see your feed"
          description="Log in to see posts from creators you subscribe to."
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className="lux-box"
        style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: '20px',
          padding: '32px',
          color: '#8e8e8e',
          textAlign: 'center',
        }}
      >
        Loading your feed…
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '20px',
          padding: '24px',
          color: '#f87171',
        }}
      >
        {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={styles.wrap}>
        <EmptyState
          title="Your feed is empty"
          description="Subscribe to creators from the Profiles tab — their posts will show up here."
          action={
            onBrowseProfiles ? (
              <button
                type="button"
                className={styles.cta}
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={onBrowseProfiles}
              >
                Browse profiles
              </button>
            ) : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {posts.map((p) => (
        <PostCard key={`${p.id}-${p.createdAt}`} post={p} />
      ))}
    </div>
  )
}
