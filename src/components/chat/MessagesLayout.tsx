import { useLocation, Outlet } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { InboxList } from './InboxList'
import styles from './MessagesLayout.module.css'
import { useThreadVersion } from '../../stores/threadStore'

function isInboxPath(path: string) {
  return path === '/messages' || path === '/messages/'
}

export function MessagesLayout() {
  const { pathname } = useLocation()
  const isWide = useMediaQuery('(min-width: 768px)')
  const inInbox = isInboxPath(pathname)
  const v = useThreadVersion()
  void v

  if (isWide) {
    if (inInbox) {
      return (
        <div className={styles.split} key={v}>
          <aside className={styles.inbox} aria-label="Inbox">
            <InboxList />
          </aside>
          <div className={styles.detail}>
            <div className={styles.empty}>Select a conversation</div>
          </div>
        </div>
      )
    }
    return (
      <div className={styles.split} key={v}>
        <aside className={styles.inbox} aria-label="Inbox">
          <InboxList />
        </aside>
        <div className={styles.detail}>
          <Outlet />
        </div>
      </div>
    )
  }
  if (inInbox) {
    return <InboxList key={v} />
  }
  return <Outlet key={v} />
}
