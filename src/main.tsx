import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './index.css'
import { App } from './app/App'
import { loadUsers } from './mocks/users'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Load users after app starts
loadUsers().catch((err) => {
  console.error('Users load failed:', err)
})