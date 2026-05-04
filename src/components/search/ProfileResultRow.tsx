import { useSubscriptionStore } from '../../stores/subscriptionStore'
import type { PublicProfile } from '../../types'
import { Avatar } from '../common/Avatar'
import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { cn } from '../../lib/cn'
import styles from './ProfileResultRow.module.css'

type Props = { user: PublicProfile }

export function ProfileResultRow({ user }: Props) {
  const currentUserId = localStorage.getItem('userId')
  const isSelf = currentUserId
    ? String(currentUserId) === String(user.id)
    : false
  const isSub = useSubscriptionStore((s) => s.isSubscribed(user.id))
  const toggle = useSubscriptionStore((s) => s.toggleSubscribe)

  return (
    <div className={styles.row}>
      <Link to={`/u/${user.username}`} className={styles.left}>
        <Avatar src={user.avatarUrl} alt="" size="md" className={styles.ava} />
        <div className={styles.meta}>
          <span className={styles.nameRow}>
            <span className={styles.name}>{user.username}</span>
            {isSelf ? <span className={styles.badge}>You</span> : null}
          </span>
          {user.bio && <span className={styles.bio}>{user.bio}</span>}
          {user.subscriberCount != null && (
            <span className={styles.sub}>
              {user.subscriberCount.toLocaleString()} subscribers
            </span>
          )}
        </div>
      </Link>
      <Button
        className={cn((!isSelf && isSub) && styles.yet)}
        variant={isSelf ? 'outline' : isSub ? 'ghost' : 'primary'}
        type="button"
        onClick={() => {
          if (!isSelf) toggle(user.id)
        }}
        aria-pressed={isSub}
        disabled={isSelf}
      >
        {isSelf ? 'You' : isSub ? 'Subscribed' : 'Subscribe'}
      </Button>
    </div>
  )
}
