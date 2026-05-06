import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import styles from './CreatePostPage.module.css'

const API = 'http://localhost:8081'

export function CreatePostPage() {
  const nav = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [tags, setTags] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = localStorage.getItem('userId') || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!userId) {
      setError('You need to be logged in.')
      return
    }
    if (!file) {
      setError('Choose an image or video to upload.')
      return
    }
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (caption.trim()) fd.append('caption', caption.trim())
      fd.append('visibility', visibility)
      if (tags.trim()) fd.append('tags', tags.trim())

      const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'X-User-Id': userId },
        body: fd,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(text || `HTTP ${res.status}`)
      }
      await res.json()
      nav('/u/me')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Create post</h1>
      <p className={styles.hint}>Uploads go to the content service (multipart). Use a photo or short video.</p>

      <form className={styles.form} onSubmit={submit}>
        <label className={styles.label}>
          Media
          <input
            className={styles.file}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label className={styles.label}>
          Caption
          <textarea
            className={styles.caption}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder="Say something about this post…"
          />
        </label>

        <label className={styles.label}>
          Visibility
          <select
            className={styles.select}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="subscribers">Subscribers only</option>
            <option value="tier">Tier</option>
          </select>
        </label>

        <label className={styles.label}>
          Tags (optional, comma-separated)
          <input
            className={styles.input}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="art, behind-the-scenes"
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={() => nav(-1)} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  )
}
