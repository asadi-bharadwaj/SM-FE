import { CURRENT_USER_ID } from '../../mocks/users'
import { MessageBubble } from './MessageBubble'
import { ChatComposer } from './ChatComposer'
import { useThreadStore } from '../../stores/threadStore'
import { useRef, useEffect } from 'react'
import type { Thread } from '../../types'
import { Avatar } from '../common/Avatar'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import styles from './ChatThread.module.css'

type Props = { thread: Thread }

export function ChatThread({ thread }: Props) {
  const isWide = useMediaQuery('(min-width: 768px)')
  const other = thread.participants.find((p) => p.id !== CURRENT_USER_ID) ?? thread.participants[0]!
  const endRef = useRef<HTMLDivElement | null>(null)
  const send = useThreadStore((s) => s.send)
  const ver = useThreadStore((s) => s.version)
  const messages = thread.messages

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ver, thread.id])

  return (
    <div className={styles.col}>
      <div className={styles.head}>
        {!isWide && (
          <Link to="/messages" className={styles.back} aria-label="Back to inbox">
            <ChevronLeft size={22} />
          </Link>
        )}
        <Avatar src={other.avatarUrl} alt="" size="md" className={styles.hAva} />
        <div>
          <div className={styles.htop}>{other.username}</div>
          <div className={styles.ht2}>Subscribers (mock)</div>
        </div>
      </div>
      <ul className={styles.messages} role="log" aria-label="Message thread" aria-relevant="additions">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </ul>
      <ChatComposer
        onSend={(body) => {
          send(thread.id, body)
        }}
      />
    </div>
  )
}
