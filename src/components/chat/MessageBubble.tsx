import styles from './MessageBubble.module.css'
import { timeAgo } from '../../lib/time'

type Props = {
  message: string;
  isMe: boolean;
  timestamp?: string;
}

export function MessageBubble({ message, isMe, timestamp }: Props) {
  return (
    <div className={isMe ? styles.mine : styles.them}>
      <div className={styles.bubble}>
        {message}
        {timestamp && (
          <div className={styles.meta} title={timestamp}>
            {timeAgo(timestamp)}
          </div>
        )}
      </div>
    </div>
  )
}
