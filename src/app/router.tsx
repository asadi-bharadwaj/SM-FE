import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '../layouts/AppLayout'
import { SearchPage } from '../pages/SearchPage'
import { FeedPage } from '../pages/FeedPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PostPage } from '../pages/PostPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { CreatePostPage } from '../pages/CreatePostPage'
import { SettingsPage } from '../pages/SettingsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

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

      {
  path: 'messages',
  element: (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <h1
          style={{
            fontSize: '42px',
            marginBottom: '14px',
            fontWeight: 800,
          }}
        >
          Messages Coming Soon
        </h1>

        <p
          style={{
            color: '#8a8a8a',
            fontSize: '16px',
            lineHeight: 1.6,
          }}
        >
          Private messaging is under development.
          A premium chat experience is on the way.
        </p>
      </div>
    </div>
  ),
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