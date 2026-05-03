import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '../layouts/AppLayout'
import { SearchPage } from '../pages/SearchPage'
import { FeedPage } from '../pages/FeedPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PostPage } from '../pages/PostPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { CreatePostPage } from '../pages/CreatePostPage'
import { SettingsPage } from '../pages/SettingsPage'
import { EditProfilePage } from '../pages/EditProfilePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

import Login from '../pages/Login'
import Register from '../pages/Register'
import { MessagesLayout } from '../components/chat/MessagesLayout'
import { MessagesInboxPage } from '../pages/MessagesInboxPage'
import { MessageThreadPage } from '../pages/MessageThreadPage'

/** Set to `true` to require a stored token for app routes (redirect to `/login` when missing). */
const REQUIRE_LOGIN = true

const isLoggedIn = () => {
  if (!REQUIRE_LOGIN) return true
  return localStorage.getItem('token') !== null
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: isLoggedIn() ? <Navigate to="/" /> : <Login />
  },

  {
    path: '/register',
    element: isLoggedIn() ? <Navigate to="/" /> : <Register />
  },

  {
    path: '/',
    element: isLoggedIn() ? <AppLayout /> : <Navigate to="/login" />,
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
      { path: 'settings/profile', element: <EditProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])