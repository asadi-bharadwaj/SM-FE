import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { apiFetch } from '../lib/api'
import { useIsPostLocked } from '../hooks/useIsPostLocked'
import { usePostEngagement } from '../hooks/usePostEngagement'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { NotFoundPage } from './NotFoundPage'
import { PostHeader } from '../components/post/PostHeader'
import { PostMedia } from '../components/post/PostMedia'
import { PostActions } from '../components/post/PostActions'
import { PostCaption } from '../components/post/PostCaption'
import { LikeCount } from '../components/post/LikeCount'
import { LikesModal } from '../components/post/LikesModal'
import { CommentList } from '../components/post/CommentList'
import { CommentComposer } from '../components/post/CommentComposer'
import type { Post } from '../types'
import styles from './PostPage.module.css'

export function PostPage() {
  const { postId } = useParams()
  const location = useLocation()
  const contextPosts = location.state?.contextPosts as Post[] | undefined
  const [p, setP] = useState<Post | null | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contextPosts && contextPosts.length > 0) {
      // If we have context posts, we don't necessarily need to fetch unless the post is missing
      // We still set 'p' to something truthy so it renders, but we actually render the list
      setP(contextPosts.find(x => String(x.id) === String(postId)) || contextPosts[0])
      
      // Attempt to scroll to the selected post after render
      setTimeout(() => {
        if (postId) {
          const el = document.getElementById(`post-container-${postId}`)
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
        }
      }, 100)
      return
    }

    if (!postId) {
      setP(null)
      return
    }
    const loadPost = async () => {
      try {
        const postData = await apiFetch(`/posts/${postId}`).then(r => r.json())
        const users = await apiFetch('/users/all').then(r => r.json())
        const author = users.find((u: any) => String(u.id) === String(postData.authorId))
        
        setP({
          ...postData,
          author: {
            username: author?.username || 'Unknown',
            avatarUrl: author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username || 'unknown'}`,
            displayName: author?.displayName || author?.username || 'Unknown'
          }
        })
      } catch (e) {
        setP(null)
      }
    }
    loadPost()
  }, [postId, contextPosts])

  if (p === undefined) return <div style={{ padding: '24px', textAlign: 'center', color: '#fff' }}>Loading post...</div>
  if (p === null) return <NotFoundPage />
  
  if (contextPosts && contextPosts.length > 0) {
    return (
      <div className={styles.page} ref={containerRef}>
        <div className={styles.backRow}>
          <button type="button" className={styles.back} onClick={() => window.history.back()}>
            ← Back
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '100px' }}>
          {contextPosts.map(post => (
            <div id={`post-container-${post.id}`} key={post.id}>
              <PostPageInner post={post} hideBackRow />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <PostPageInner post={p} />
}

function PostPageInner({ post: p, hideBackRow }: { post: Post, hideBackRow?: boolean }) {
  const nav = useNavigate()
  const locked = useIsPostLocked(p)
  const toggle = useSubscriptionStore((s) => s.toggleSubscribe)
  const { likeCount } = usePostEngagement(p)
  const [showLikes, setShowLikes] = useState(false)
  return (
    <div className={styles.page}>
      {!hideBackRow && (
        <div className={styles.backRow}>
          <button type="button" className={styles.back} onClick={() => nav(-1)}>
            ← Back
          </button>
          <span className={styles.muted}>
            <Link to={`/u/${p.author.username}`}>@{p.author.username}</Link>
          </span>
        </div>
      )}
      <article className={styles.inner}>
        <PostHeader post={p} />
        <PostMedia post={p} locked={locked} onSubscribe={() => toggle(p.authorId)} />
        <PostActions 
          post={p} 
          disabled={locked} 
          onOpenComments={() => document.getElementById(`commentInput-${p.id}`)?.focus()} 
        />
        <LikeCount
          count={likeCount}
          disabled={locked}
          onClick={locked ? undefined : () => setShowLikes(true)}
        />
        {showLikes && !locked && (
          <LikesModal postId={p.id} likeCount={likeCount} onClose={() => setShowLikes(false)} />
        )}
        <PostCaption post={p} locked={locked} showCommentCta={false} />
        <CommentList post={p} locked={locked} />
        <CommentComposer post={p} disabled={locked} />
      </article>
    </div>
  )
}
