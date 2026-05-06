import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '../layouts/AppLayout'
import { SearchPage } from '../pages/SearchPage'
import { FeedPage } from '../pages/FeedPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PostPage } from '../pages/PostPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { CreatePostPage } from '../pages/CreatePostPage'
import { SettingsPage } from '../pages/SettingsPage'
import { EditProfilePage } from '../pages/settings/EditProfilePage'
import { SettingsSectionPlaceholder } from '../pages/settings/SettingsSectionPlaceholder'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { MessagesInboxPage } from '../pages/MessagesInboxPage'
import { MessageThreadPage } from '../pages/MessageThreadPage'

import Login from '../pages/Login'
import Register from '../pages/Register'

const isLoggedIn = () => {
  return localStorage.getItem("token") !== null
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
      { path: 'messages', element: <MessagesInboxPage /> },
      { path: 'messages/:threadId', element: <MessageThreadPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'create', element: <CreatePostPage /> },
      { path: 'reels', element: <PlaceholderPage /> },
      { path: 'more', element: <PlaceholderPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/account', element: <EditProfilePage /> },
      {
        path: 'settings/saved-posts',
        element: (
          <SettingsSectionPlaceholder
            title="Saved posts"
            description="Your saved posts will show here. You can also open them from your profile under the Saved tab."
          />
        ),
      },
      {
        path: 'settings/time-management',
        element: (
          <SettingsSectionPlaceholder
            title="Time management"
            description="Set daily reminders and limits for how you use ShowMe."
          />
        ),
      },
      {
        path: 'settings/blocked',
        element: (
          <SettingsSectionPlaceholder
            title="Blocked"
            description="Accounts you block will appear here. Blocking is not available yet."
          />
        ),
      },
      {
        path: 'settings/close-friends',
        element: (
          <SettingsSectionPlaceholder
            title="Close friends"
            description="Choose who sees more of your activity. This feature is coming soon."
          />
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
