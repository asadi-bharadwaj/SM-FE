import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { PostCard } from '../components/post/PostCard'
import type { Post } from '../types'

export function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiFetch('/posts/feed').then(res => res.json())
        const feedArray = Array.isArray(data) ? data : []
        
        const mappedPosts = feedArray
          .filter((p: any) => String(p.id) !== '1' && String(p.id) !== '2' && String(p.id) !== '3')
          .map((post: any) => {
            const author = post.author
            return {
              ...post,
              author: {
                username: author?.username || 'Unknown',
                avatarUrl: author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username || 'unknown'}`,
                displayName: author?.displayName || author?.username || 'Unknown'
              }
            }
          })
        setPosts(mappedPosts)
      } catch (err) {
        console.error("Failed to fetch feed:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#fff' }}>Loading feed...</div>
  }

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '40px auto',
        padding: '0',
      }}
    >
      <h2 style={{ fontSize: '28px', marginBottom: '24px', paddingLeft: '24px', color: '#fff' }}>
        Your Feed
      </h2>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#111', borderRadius: '16px' }}>
          <p style={{ color: '#aaa', marginBottom: '24px' }}>
            No posts available yet. Creators can publish content soon.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}