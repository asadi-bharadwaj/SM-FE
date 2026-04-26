import { useSubscriptionStore } from '../../stores/subscriptionStore'
import type { PublicProfile } from '../../types'
import { Avatar } from '../common/Avatar'
import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { cn } from '../../lib/cn'
import styles from './ProfileResultRow.module.css'

type Props = { user: PublicProfile }

export function ProfileResultRow({ user }: Props) {
  const isSub = useSubscriptionStore((s) => s.isSubscribed(user.id))
  const toggle = useSubscriptionStore((s) => s.toggleSubscribe)

  return (
    <div className={styles.row}>
      <Link to={`/u/${user.username}`} className={styles.left}>
        <Avatar src={user.avatarUrl} alt="" size="md" className={styles.ava} />
        <div className={styles.meta}>
          <span className={styles.name}>{user.username}</span>
          {user.bio && <span className={styles.bio}>{user.bio}</span>}
          {user.subscriberCount != null && (
            <span className={styles.sub}>
              {user.subscriberCount.toLocaleString()} subscribers
            </span>
          )}
        </div>
      </Link>
      <Button
        className={cn(isSub && styles.yet)}
        variant={isSub ? 'ghost' : 'primary'}
        type="button"
        onClick={() => toggle(user.id)}
        aria-pressed={isSub}
      >
        {isSub ? 'Subscribed' : 'Subscribe'}
      </Button>
    </div>
  )
}
