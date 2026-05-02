import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './index.css'
import { App } from './app/App'
import { loadUsers } from './mocks/users'

const root = createRoot(document.getElementById('root')!)

loadUsers()
  .then(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
  .catch((error) => {
    console.error('Failed to load users:', error)

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })