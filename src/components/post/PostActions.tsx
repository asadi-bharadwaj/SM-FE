import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'
import { IconButton } from '../common/IconButton'
import { usePostEngagement } from '../../hooks/usePostEngagement'
import styles from './PostActions.module.css'

type Props = {
  postId: string
  disabled?: boolean
  onOpenComments?: () => void
}

export function PostActions({ postId, disabled, onOpenComments }: Props) {
  const { liked, toggleLike } = usePostEngagement(postId)
  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <IconButton
          type="button"
          label={liked ? 'Unlike' : 'Like'}
          onClick={() => !disabled && toggleLike()}
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
          onClick={onOpenComments}
        >
          <MessageCircle size={28} strokeWidth={1.75} />
        </IconButton>
        <IconButton type="button" label="Share">
          <Send size={28} strokeWidth={1.75} />
        </IconButton>
      </div>
      <IconButton type="button" label="Save" className={disabled ? styles.muted : undefined}>
        <Bookmark size={28} strokeWidth={1.75} />
      </IconButton>
    </div>
  )
}
