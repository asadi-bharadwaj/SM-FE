import { CURRENT_USER_ID } from '../../mocks/users'
import type { Message } from '../../types'
import styles from './MessageBubble.module.css'
import { timeAgo } from '../../lib/time'

type Props = { message: Message }

export function MessageBubble({ message }: Props) {
  const mine = message.senderId === CURRENT_USER_ID
  return (
    <li className={mine ? styles.mine : styles.them} aria-label="Message">
      <div className={styles.bubble}>
        {message.body}
        <div className={styles.meta} title={message.createdAt}>
          {timeAgo(message.createdAt)}
        </div>
      </div>
    </li>
  )
}
