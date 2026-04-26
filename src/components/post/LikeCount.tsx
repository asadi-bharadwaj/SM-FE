import styles from './LikeCount.module.css'

type Props = {
  count: number
  onClick?: () => void
  disabled?: boolean
}

export function LikeCount({ count, onClick, disabled }: Props) {
  if (count <= 0) return null
  return (
    <p className={styles.root}>
      <button
        type="button"
        className={styles.btn}
        onClick={onClick}
        disabled={disabled}
        aria-label={`${count} likes`}
      >
        {count === 1 ? '1 like' : `${count.toLocaleString()} likes`}
      </button>
    </p>
  )
}
