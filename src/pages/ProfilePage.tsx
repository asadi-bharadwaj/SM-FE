import { useParams } from 'react-router-dom'
import { getUserByUsername, getPostsByAuthor, CURRENT_USER_ID } from '../mocks'
import { ProfilePageView } from '../components/profile/ProfilePageView'
import { NotFoundPage } from './NotFoundPage'

export function ProfilePage() {
  const { username } = useParams()
  if (!username) return <NotFoundPage />
  const u = getUserByUsername(username)
  if (!u) return <NotFoundPage />
  const posts = getPostsByAuthor(username)
  const isMe = u.id === CURRENT_USER_ID
  return <ProfilePageView user={u} posts={posts} isMe={isMe} />
}
