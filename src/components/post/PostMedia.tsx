import { cn } from '../../lib/cn'
import type { Post } from '../../types'
import { LockedPostOverlay } from './LockedPostOverlay'
import styles from './PostMedia.module.css'

type Props = {
  post: Post
  locked: boolean
  onSubscribe?: () => void
  className?: string
}

export function PostMedia({ post, locked, onSubscribe, className }: Props) {
  return (
    <div className={cn(styles.frame, className)}>
      {post.mediaType === 'image' ? (
        <img
          className={cn(styles.media, locked && styles.blur)}
          src={post.mediaUrl}
          alt=""
        />
      ) : (
        <div className={styles.videoPlaceholder}>Video</div>
      )}
      {locked ? <LockedPostOverlay onSubscribe={onSubscribe} /> : null}
    </div>
  )
}
