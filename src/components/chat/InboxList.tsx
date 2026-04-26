import { getThreads } from '../../mocks/threads'
import { InboxRow } from './InboxRow'
import { useThreadVersion } from '../../stores/threadStore'
import styles from './InboxList.module.css'

export function InboxList() {
  const ver = useThreadVersion()
  const threads = getThreads()
  void ver

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>Messages</h2>
      <ul className={styles.list} aria-label="Conversations">
        {threads.map((t) => (
          <InboxRow key={t.id} t={t} />
        ))}
      </ul>
    </div>
  )
}
