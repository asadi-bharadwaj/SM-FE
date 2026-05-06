const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'Just now'
  
  const date = new Date(iso)
  const t = date.getTime()
  
  if (isNaN(t)) return 'Just now'
  
  const s = (Date.now() - t) / 1000
  
  // Handle future dates (network lag) or very recent dates
  if (s < 5) return 'Just now'
  
  if (s < 60) return rtf.format(-Math.floor(s), 'second')
  if (s < 3600) return rtf.format(-Math.floor(s / 60), 'minute')
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), 'hour')
  if (s < 604800) return rtf.format(-Math.floor(s / 86400), 'day')
  if (s < 2592000) return rtf.format(-Math.floor(s / 604800), 'week')
  return rtf.format(-Math.floor(s / 2592000), 'month')
}
