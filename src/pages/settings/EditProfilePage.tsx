import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { AvatarUpload } from '../../components/settings/AvatarUpload'

export function EditProfilePage() {
  const userId = localStorage.getItem('userId')

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    country: '',
    language: '',
    avatarUrl: '',
  })

  useEffect(() => {
    fetch('http://localhost:8081/users/me', {
      headers: { 'X-User-Id': userId || '' },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          displayName: data.displayName || '',
          bio: data.bio || '',
          country: data.country || '',
          language: data.language || '',
          avatarUrl: data.avatarUrl || '',
        })
      })
      .catch(() => {})
  }, [userId])

  const save = async () => {
    const res = await fetch('http://localhost:8081/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId || '',
      },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      alert('Profile Updated')
    } else {
      alert('Failed')
    }
  }

  const handleAvatarChange = (avatarUrl: string) => {
    setForm((prev) => ({ ...prev, avatarUrl }))
  }

  const fieldStyle: CSSProperties = {
    padding: '14px 16px',
    background: 'rgba(25, 25, 25, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: 'auto',
        padding: 20,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <Link
        to="/settings"
        style={{
          color: '#888',
          textDecoration: 'none',
          fontSize: '0.9rem',
          alignSelf: 'flex-start',
        }}
      >
        ← Settings
      </Link>

      <h2
        style={{
          textAlign: 'center',
          color: 'white',
          margin: 0,
          fontSize: '2rem',
          fontWeight: 700,
        }}
      >
        Edit profile
      </h2>

      <AvatarUpload currentAvatarUrl={form.avatarUrl} onAvatarChange={handleAvatarChange} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          placeholder="Display Name"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          style={fieldStyle}
        />

        <textarea
          placeholder="Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          style={{
            ...fieldStyle,
            resize: 'vertical',
            minHeight: '80px',
          }}
        />

        <input
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          style={fieldStyle}
        />

        <input
          placeholder="Language"
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          style={fieldStyle}
        />

        <button
          type="button"
          onClick={save}
          style={{
            padding: '16px 20px',
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(6, 182, 212, 0.8) 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
          }}
        >
          Save profile
        </button>
      </div>
    </div>
  )
}
