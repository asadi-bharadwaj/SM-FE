import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileHeader } from './ProfileHeader'
import { PostGrid } from './PostGrid'
import type { PublicProfile } from '../../types'
import type { Post } from '../../types'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import styles from './ProfilePageView.module.css'

type Props = {
  user: PublicProfile
  posts: Post[]
  isMe: boolean
}

export function ProfilePageView({ user, posts, isMe }: Props) {
  const [tab, setTab] = useState<'posts' | 'saved'>('posts')
  const isSub = useSubscriptionStore((s) => s.isSubscribed(user.id))
  const toggle = useSubscriptionStore((s) => s.toggleSubscribe)
  const nav = useNavigate()
  return (
    <div className={styles.page}>
      <ProfileHeader
        user={user}
        postCount={posts.length}
        isMe={isMe}
        isSubscribed={isSub}
        onSubscribe={() => toggle(user.id)}
        onMessage={!isMe && isSub ? () => nav('/messages/t1') : undefined}
      />
      <p className={styles.display}>{user.displayName}</p>
      {user.bio && <p className={styles.bio}>{user.bio}</p>}
      {user.link && (
        <a href={user.link} className={styles.link} target="_blank" rel="noreferrer">
          {user.link.replace(/^https?:\/\//, '')}
        </a>
      )}
      <p className={styles.priceLine}>From $4.99/mo · full library for subscribers</p>
      <div className={styles.tabs} role="tablist" aria-label="Content tabs">
        <button
          className={tab === 'posts' ? styles.tactive : undefined}
          onClick={() => setTab('posts')}
          type="button"
        >
          Posts
        </button>
        {isMe && (
          <button
            className={tab === 'saved' ? styles.tactive : undefined}
            onClick={() => setTab('saved')}
            type="button"
          >
            Saved
          </button>
        )}
      </div>
      {tab === 'posts' && <PostGrid posts={posts} />}
      {tab === 'saved' && isMe && (
        <p className={styles.savedEmpty}>No saved posts (UI mock)</p>
      )}
    </div>
  )
}
