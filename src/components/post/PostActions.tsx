import { useState } from 'react'
import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'
import { IconButton } from '../common/IconButton'
import { ShareModal } from './ShareModal'
import { usePostEngagement } from '../../hooks/usePostEngagement'
import { playTickSound } from '../../lib/audio'
import styles from './PostActions.module.css'

type Props = {
  post: { id: string, authorId: string }
  disabled?: boolean
  onOpenComments?: () => void
}

export function PostActions({ post, disabled, onOpenComments }: Props) {
  const { liked, toggleLike, isSaved, toggleSave } = usePostEngagement(post)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const handleShare = () => {
    setIsShareOpen(true)
  }

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <IconButton
          type="button"
          label={liked ? 'Unlike' : 'Like'}
          onClick={() => {
            if (!disabled) {
              if (!liked) playTickSound();
              toggleLike();
            }
          }}
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
        <IconButton type="button" label="Share" onClick={handleShare}>
          <Send size={28} strokeWidth={1.75} />
        </IconButton>
      </div>
      <IconButton 
        type="button" 
        label={isSaved ? 'Unsave' : 'Save'} 
        className={disabled ? styles.muted : undefined}
        onClick={() => !disabled && toggleSave()}
      >
        <Bookmark 
          size={28} 
          strokeWidth={1.75} 
          fill={isSaved ? 'currentColor' : 'none'}
        />
      </IconButton>

      {isShareOpen && (
        <ShareModal 
          postId={post.id} 
          onClose={() => setIsShareOpen(false)} 
        />
      )}
    </div>
  )
}
