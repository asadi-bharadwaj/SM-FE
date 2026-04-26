const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function timeAgo(iso: string): string {
  const t = new Date(iso).getTime()
  const s = (Date.now() - t) / 1000
  if (s < 60) return rtf.format(-Math.floor(s), 'second')
  if (s < 3600) return rtf.format(-Math.floor(s / 60), 'minute')
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), 'hour')
  if (s < 604800) return rtf.format(-Math.floor(s / 86400), 'day')
  if (s < 2592000) return rtf.format(-Math.floor(s / 604800), 'week')
  return rtf.format(-Math.floor(s / 2592000), 'month')
}
