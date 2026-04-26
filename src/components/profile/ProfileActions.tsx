import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { cn } from '../../lib/cn'
import styles from './ProfileActions.module.css'

type Props = {
  isMe: boolean
  isSubscribed: boolean
  onSubscribe: () => void
  onMessage?: () => void
}

export function ProfileActions({
  isMe,
  isSubscribed,
  onSubscribe,
  onMessage,
}: Props) {
  const nav = useNavigate()
  if (isMe) {
    return (
      <div className={styles.row}>
        <Button
          className={styles.pill}
          type="button"
          variant="outline"
          onClick={() => nav('/settings')}
        >
          Edit profile
        </Button>
        <Button
          className={styles.pill}
          type="button"
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(window.location.href)
          }}
        >
          Share
        </Button>
      </div>
    )
  }
  return (
    <div className={styles.row}>
      <Button
        className={cn(isSubscribed && styles.subbed)}
        type="button"
        variant={isSubscribed ? 'outline' : 'primary'}
        onClick={onSubscribe}
        aria-pressed={isSubscribed}
      >
        {isSubscribed ? 'Subscribed' : 'Subscribe'}
      </Button>
      {onMessage ? (
        <Button
          className={styles.pill}
          type="button"
          variant="outline"
          onClick={onMessage}
        >
          Message
        </Button>
      ) : null}
    </div>
  )
}
