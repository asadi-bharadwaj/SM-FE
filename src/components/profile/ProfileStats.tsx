import styles from './ProfileStats.module.css'

type Props = {
  postCount: number
  subscriberCount?: number
}

export function ProfileStats({ postCount, subscriberCount }: Props) {
  return (
    <ul className={styles.stats} aria-label="Account stats">
      <li>
        <span className={styles.n}>{postCount.toLocaleString()}</span> posts
      </li>
      {subscriberCount != null && (
        <li>
          <span className={styles.n}>{subscriberCount.toLocaleString()}</span> subscribers
        </li>
      )}
    </ul>
  )
}
