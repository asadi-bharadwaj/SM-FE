import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import styles from './ChatComposer.module.css'

type Props = { onSend: (body: string) => void; disabled?: boolean }

export function ChatComposer({ onSend, disabled }: Props) {
  const [t, setT] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (disabled) return
    if (!t.trim()) return
    onSend(t.trim())
    setT('')
  }
  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        className={styles.input}
        name="m"
        placeholder="Message…"
        value={t}
        onChange={(e) => setT(e.target.value)}
        disabled={disabled}
        maxLength={2000}
        autoComplete="off"
      />
      <button
        className={styles.send}
        type="submit"
        disabled={!t.trim() || disabled}
        aria-label="Send"
      >
        <Send size={20} />
      </button>
    </form>
  )
}
