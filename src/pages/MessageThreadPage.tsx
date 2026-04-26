import { useParams } from 'react-router-dom'
import { getThread } from '../mocks/threads'
import { useThreadVersion } from '../stores/threadStore'
import { NotFoundPage } from './NotFoundPage'
import { ChatThread } from '../components/chat/ChatThread'

export function MessageThreadPage() {
  const { threadId } = useParams()
  const v = useThreadVersion()
  if (!threadId) return <NotFoundPage />
  const t = getThread(threadId)
  if (!t) return <NotFoundPage />
  return <ChatThread key={`${t.id}-${v}`} thread={t} />
}
