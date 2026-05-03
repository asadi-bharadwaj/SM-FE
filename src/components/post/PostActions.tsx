import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'
import { IconButton } from '../common/IconButton'
import { usePostEngagement } from '../../context/PostEngagementContext'
import styles from './PostActions.module.css'

async function sharePostUrl(postId: string) {
  const url = `${window.location.origin}/p/${postId}`
  try {
    if (navigator.share) {
      await navigator.share({ title: 'ShowMe', url })
      return
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return
  }
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    window.prompt('Copy this link:', url)
  }
}

type Props = {
  postId: string
  disabled?: boolean
  onOpenComments?: () => void
}

export function PostActions({ postId, disabled, onOpenComments }: Props) {
  const { liked, saved, toggleLike, toggleSave } = usePostEngagement()

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <IconButton
          type="button"
          label={liked ? 'Unlike' : 'Like'}
          disabled={disabled}
          onClick={() => !disabled && void toggleLike()}
          className={disabled ? styles.muted : undefined}
        >
          <Heart
            size={28}
            strokeWidth={1.75}
            className={liked ? styles.liked : undefined}
            fill={liked ? 'currentColor' : 'none'}
          />
        </IconButton>
        <IconButton
          type="button"
          label="Comment"
          disabled={disabled}
          onClick={() => !disabled && onOpenComments?.()}
          className={disabled ? styles.muted : undefined}
        >
          <MessageCircle size={28} strokeWidth={1.75} />
        </IconButton>
        <IconButton
          type="button"
          label="Share"
          disabled={disabled}
          onClick={() => !disabled && void sharePostUrl(postId)}
          className={disabled ? styles.muted : undefined}
        >
          <Send size={28} strokeWidth={1.75} />
        </IconButton>
      </div>
      <IconButton
        type="button"
        label={saved ? 'Remove from saved' : 'Save'}
        disabled={disabled}
        onClick={() => !disabled && void toggleSave()}
        className={disabled ? styles.muted : undefined}
      >
        <Bookmark
          size={28}
          strokeWidth={1.75}
          className={saved ? styles.saved : undefined}
          fill={saved ? 'currentColor' : 'none'}
        />
      </IconButton>
    </div>
  )
}
