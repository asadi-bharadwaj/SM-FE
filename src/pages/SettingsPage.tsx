import { Link } from "react-router-dom";
import styles from "./SettingsHub.module.css";

/** Settings home — profile editing lives at /settings/profile (Edit profile). */
export function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-card">
        <header className="settings-header" style={{ borderBottom: "none", paddingBottom: 8 }}>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage your account and how ShowMe works for you.
          </p>
        </header>

        <nav className={styles.nav} aria-label="Settings sections">
          <Link className={styles.row} to="/settings/profile">
            <span className={styles.rowTitle}>Profile & appearance</span>
            <span className={styles.rowHint}>Name, bio, avatar, and region</span>
            <span className={styles.chev} aria-hidden>
              →
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
