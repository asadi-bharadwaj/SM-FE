export function searchMatch(q: string, text: string): boolean {
  return text.toLowerCase().includes(q.trim().toLowerCase())
}
