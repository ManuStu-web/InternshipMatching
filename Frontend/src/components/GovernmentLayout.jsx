import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/government/dashboard', icon: '▣' },
  { label: 'Internships', path: '/government/internships', icon: '⌕' },
  { label: 'Candidates', path: '/government/candidates', icon: '◉' },
  { label: 'Allocations', path: '/government/allocations', icon: '⚑' },
  { label: 'Feedback', path: '/government/feedback', icon: '✎' },
  { label: 'Analytics', path: '/government/analytics', icon: '∑' },
];

export default function GovernmentLayout({ activePath, onNavigate, theme, onThemeToggle, children }) {
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [activePath]);

  return (
    <div className="candidate-app-shell">
      <aside className={`candidate-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-brand">
            <span className="brand-mark">G</span>
            <div>
              <strong>Intern</strong>Setu
            </div>
          </div>

          <p className="sidebar-tagline">Government Portal — allocations and matching</p>
        </div>

        <nav className="sidebar-nav" aria-label="Government navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => onNavigate(item.path)}
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
              <p className="eyebrow dark"><span /> GOVERNMENT PORTAL</p>
              <h1>InternSetu</h1>
            </div>
          </div>

          <div className="header-actions">
            <div className="user-pill">
              <span className="avatar">{(session?.user?.name || 'G').charAt(0).toUpperCase()}</span>
              <span>{session?.user?.name || 'Government'}</span>
            </div>
            <button type="button" className="theme-toggle" onClick={onThemeToggle} aria-label="Toggle theme">
              Theme
            </button>
          </div>
        </header>

        <main className="candidate-content">{children}</main>
      </div>
    </div>
  );
}
