import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../common/Avatar'

type Props = {
  postId: string
}

export function SharedPostPreview({ postId }: Props) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiFetch(`/posts/${postId}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  if (loading) {
    return (
      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '8px' }}>
        <div style={{ color: '#888', fontSize: '12px' }}>Loading post preview...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '8px' }}>
        <div style={{ color: '#ff4d4d', fontSize: '12px' }}>Post unavailable or deleted</div>
      </div>
    )
  }

  const avatar = post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`

  return (
    <div 
      onClick={() => nav(`/p/${postId}`)}
      style={{
        marginTop: '8px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background 0.2s',
        width: '240px' // Fix width for chat bubble
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    >
      <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Avatar src={avatar} alt="" size="sm" />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{post.author?.username}</span>
      </div>
      
      {post.mediaUrl && (
        <div style={{ width: '100%', height: '160px', backgroundColor: '#000' }}>
          {post.mediaType?.toUpperCase() === 'VIDEO' ? (
            <video src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={post.mediaUrl} alt="Post preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
      )}
      
      <div style={{ padding: '10px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#ccc', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.caption || 'View post'}
        </p>
      </div>
    </div>
  )
}
