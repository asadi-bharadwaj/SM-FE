import { useState } from 'react'
import { usePostEngagement } from '../../hooks/usePostEngagement'
import styles from './CommentComposer.module.css'

type Props = { postId: string; disabled?: boolean }

export function CommentComposer({ postId, disabled }: Props) {
  const [t, setT] = useState('')
  const { addComment } = usePostEngagement(postId)
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (disabled) return
        if (!t.trim()) return
        addComment(t)
        setT('')
      }}
    >
      <input
        className={styles.input}
        name="comment"
        placeholder="Add a comment…"
        value={t}
        onChange={(e) => setT(e.target.value)}
        disabled={disabled}
        maxLength={2200}
        autoComplete="off"
      />
      {t.trim() && !disabled ? (
        <button type="submit" className={styles.send}>
          Post
        </button>
      ) : null}
    </form>
  )
}
