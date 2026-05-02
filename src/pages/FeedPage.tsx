import { Link } from 'react-router-dom'

export function FeedPage() {
  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '40px auto',
        padding: '24px',
        textAlign: 'center',
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
      }}
    >
      <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>
        Welcome
      </h2>

      <p style={{ color: '#aaa', marginBottom: '24px' }}>
        No posts available yet. Creators can publish content soon.
      </p>

      <Link
        to="/create"
        style={{
          display: 'inline-block',
          padding: '12px 20px',
          background: '#fff',
          color: '#000',
          borderRadius: '10px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Create First Post
      </Link>
    </div>
  )
}