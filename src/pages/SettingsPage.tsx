import { Button } from '../components/common/Button'

export function SettingsPage() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 0.5rem 2rem',
      }}
    >
      <h1
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          margin: '0 0 0.5rem',
        }}
      >
        Account &amp; subscription
      </h1>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 14,
          margin: '0 0 1rem',
          lineHeight: 1.5,
        }}
      >
        Mock settings: billing, cancel subscription, and email preferences are placeholders
        for a real backend.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void window.location.reload()
        }}
      >
        Restore defaults (reload)
      </Button>
    </div>
  )
}
