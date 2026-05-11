import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Send, Smile } from 'lucide-react'
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react'
import styles from './ChatComposer.module.css'

type Props = { onSend: (body: string) => void; disabled?: boolean }

export function ChatComposer({ onSend, disabled }: Props) {
  const [t, setT] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [pickerOpen])

  const onEmojiClick = (data: EmojiClickData) => {
    setT((prev) => (prev + data.emoji).slice(0, 2000))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (disabled) return
    if (!t.trim()) return
    onSend(t.trim())
    setT('')
    setPickerOpen(false)
  }
  return (
    <div className={styles.wrap} ref={wrapRef}>
      {pickerOpen && (
        <div className={styles.picker}>
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={onEmojiClick}
            width={320}
            height={380}
            lazyLoadEmojis
            searchPlaceholder="Search emojis…"
          />
        </div>
      )}
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
          className={styles.emoji}
          type="button"
          disabled={disabled}
          aria-label="Emoji"
          aria-expanded={pickerOpen}
          onClick={() => setPickerOpen((o) => !o)}
        >
          <Smile size={22} />
        </button>
        <button
          className={styles.send}
          type="submit"
          disabled={!t.trim() || disabled}
          aria-label="Send"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
