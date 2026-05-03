export { searchUsers, getUserByUsername, getUserById, CURRENT_USER_ID } from './users'
export { MOCK_POSTS, getPost, getPostsByAuthor, getFeedPosts, searchPosts } from './posts'
export { getThreads, getThread, appendMessage } from './threads'

export function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(v), ms))
}
