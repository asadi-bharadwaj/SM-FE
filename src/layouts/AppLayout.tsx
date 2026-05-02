import { Outlet, Link, useLocation } from 'react-router-dom'

function NavItem({
  to,
  label,
}: {
  to: string
  label: string
}) {
  const { pathname } = useLocation()

  const active = pathname === to || pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        textDecoration: 'none',
        color: '#fff',
        background: active ? '#222' : 'transparent',
        fontWeight: active ? 700 : 500,
      }}
    >
      {label}
    </Link>
  )
}

export function AppLayout() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
      }}
    >
      <aside
        style={{
          borderRight: '1px solid #222',
          padding: '20px',
        }}
      >
        <h2 style={{ marginBottom: '24px' }}>ShowMe</h2>

        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <NavItem to="/u/me" label="My Profile" />
          <NavItem to="/search" label="Profiles" />
          <NavItem to="/feed" label="Feed" />
          <NavItem to="/create" label="Create Post" />
          <NavItem to="/messages" label="Messages" />
          <NavItem to="/notifications" label="Notifications" />
          <NavItem to="/settings" label="Settings" />
        </nav>
      </aside>

      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  )
}