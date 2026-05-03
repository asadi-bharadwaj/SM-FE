import { forwardRef, useState } from 'react'
import { usePostEngagement } from '../../context/PostEngagementContext'
import styles from './CommentComposer.module.css'

type Props = { postId: string; disabled?: boolean }

export const CommentComposer = forwardRef<HTMLInputElement, Props>(
  function CommentComposer({ postId, disabled }, ref) {
  const [t, setT] = useState('')
  const { addComment } = usePostEngagement()
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (disabled) return
        if (!t.trim()) return
        void addComment(t)
          .then(() => setT(''))
          .catch(() => {})
      }}
    >
      <input
        ref={ref}
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
  },
)
