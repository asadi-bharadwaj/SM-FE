import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import styles from './ChatComposer.module.css'

type Props = {
  onSend: (body: string) => void | Promise<void>
  disabled?: boolean
}

export function ChatComposer({ onSend, disabled }: Props) {
  const [t, setT] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (disabled) return
    const body = t.trim()
    if (!body) return
    setT('')
    try {
      await Promise.resolve(onSend(body))
    } catch {
      setT(body)
    }
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
