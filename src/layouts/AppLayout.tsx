import { Outlet, Link, useLocation } from "react-router-dom";

function Item({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();

  const active =
    pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      style={{
        padding: "12px 16px",
        borderRadius: "12px",
        color: "#fff",
        textDecoration: "none",
        background: active ? "#1f1f1f" : "transparent",
        fontWeight: active ? 700 : 500,
        transition: "0.2s",
      }}
    >
      {label}
    </Link>
  );
}

export function AppLayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
      }}
    >
      <aside
        style={{
          padding: "24px",
          borderRight: "1px solid #222",
        }}
      >
        <h2 style={{ marginBottom: "28px" }}>ShowMe</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Item to="/" label="Home" />
          <Item to="/u/me" label="Profile" />
          <Item to="/messages" label="Messages" />
          <Item to="/notifications" label="Notifications" />
          <Item to="/settings" label="Settings" />
        </div>
      </aside>

      <main style={{ padding: "24px" }}>
        <Outlet />
      </main>
    </div>
  );
}