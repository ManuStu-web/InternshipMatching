import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Overview', path: '/government/dashboard', icon: '▣' },
  { label: 'Internships', path: '/government/internships', icon: '💼' },
  { label: 'Candidates', path: '/government/candidates', icon: '👥' },
  { label: 'Allocations', path: '/government/allocations', icon: '⚖' },
];

function ThemeToggle({ theme, onToggle }) {
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label="Toggle theme">
      <span>{theme === 'dark' ? '☀' : '☾'}</span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default function GovernmentLayout({ activePath, onNavigate, theme, onThemeToggle, children }) {
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (path) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <div className="candidate-app-shell">
      <aside className={`candidate-sidebar ${mobileOpen ? 'open' : ''}`} style={{ borderRight: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
        <div>
          <div className="sidebar-brand">
            <span className="brand-mark" style={{ background: 'var(--color-primary-dark)' }}>G</span>
            <div>
              <strong>Gov</strong>Portal
            </div>
          </div>

          <p className="sidebar-tagline">Manage SIH Internship Scheme & Allocations.</p>
        </div>

        <nav className="sidebar-nav" aria-label="Government navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="nav-item logout-item" onClick={logout}>
            <span className="nav-icon">⇠</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="candidate-main-panel">
        <header className="candidate-header">
          <div className="header-left">
            <button type="button" className="mobile-nav-button" onClick={() => setMobileOpen((current) => !current)} aria-label="Toggle navigation">
              ☰
            </button>
            <div>
              <p className="eyebrow dark"><span style={{ background: 'var(--color-primary)' }} /> GOVERNMENT CONTROL PANEL</p>
              <h1>InternSetu Admin</h1>
            </div>
          </div>

          <div className="header-actions">
            <div className="user-pill">
              <span className="avatar" style={{ background: 'var(--color-primary-dark)' }}>
                {(session?.user?.name || 'A').charAt(0).toUpperCase()}
              </span>
              <span>{session?.user?.name || 'Admin'}</span>
            </div>
            <ThemeToggle theme={theme || 'light'} onToggle={onThemeToggle || (() => {})} />
          </div>
        </header>

        <main className="candidate-content">{children}</main>
      </div>
    </div>
  );
}
