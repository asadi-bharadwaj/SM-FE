import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { SearchPage } from '../pages/SearchPage'
import { FeedPage } from '../pages/FeedPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PostPage } from '../pages/PostPage'
import { MessagesInboxPage } from '../pages/MessagesInboxPage'
import { MessageThreadPage } from '../pages/MessageThreadPage'
import { MessagesLayout } from '../components/chat/MessagesLayout'
import { NotificationsPage } from '../pages/NotificationsPage'
import { CreatePostPage } from '../pages/CreatePostPage'
import { SettingsPage } from '../pages/SettingsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <SearchPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'u/:username', element: <ProfilePage /> },
      { path: 'p/:postId', element: <PostPage /> },
      {
        path: 'messages',
        element: <MessagesLayout />,
        children: [
          { index: true, element: <MessagesInboxPage /> },
          { path: ':threadId', element: <MessageThreadPage /> },
        ],
      },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'create', element: <CreatePostPage /> },
      { path: 'reels', element: <PlaceholderPage /> },
      { path: 'more', element: <PlaceholderPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
