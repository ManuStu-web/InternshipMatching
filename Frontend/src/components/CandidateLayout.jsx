import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: '▣' },
  { label: 'My Profile', path: '/candidate/profile', icon: '◉' },
  { label: 'Resume', path: '/candidate/resume', icon: '☰' },
  { label: 'Internships', path: '/candidate/internships', icon: '⌕' },
  { label: 'Allocations', path: '/candidate/allocations', icon: '⚑' },
];

function ThemeToggle({ theme, onToggle }) {
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label="Toggle theme">
      <span>{theme === 'dark' ? '☀' : '☾'}</span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default function CandidateLayout({ activePath, onNavigate, theme, onThemeToggle, children }) {
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
            <span className="brand-mark">I</span>
            <div>
              <strong>Intern</strong>Setu
            </div>
          </div>

          <p className="sidebar-tagline">AI-powered internship matching and allocation for India’s youth.</p>
        </div>

        <nav className="sidebar-nav" aria-label="Candidate navigation">
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

          <button
            type="button"
            className="nav-item logout-item"
            onClick={logout}
            style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}
          >
            <span className="nav-icon">⇠</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>


      <div className="candidate-main-panel">
        <header className="candidate-header">
          <div className="header-left">
            <button type="button" className="mobile-nav-button" onClick={() => setMobileOpen((current) => !current)} aria-label="Toggle navigation">
              ☰
            </button>
            <div>
              <p className="eyebrow dark"><span /> CANDIDATE PORTAL</p>
              <h1>InternSetu</h1>
            </div>
          </div>

          <div className="header-actions">
            <div className="user-pill">
              <span className="avatar">{(session?.user?.name || 'C').charAt(0).toUpperCase()}</span>
              <span>{session?.user?.name || 'Candidate'}</span>
            </div>
            <ThemeToggle theme={theme || 'light'} onToggle={onThemeToggle || (() => {})} />
          </div>
        </header>

        <main className="candidate-content">{children}</main>
      </div>
    </div>
  );
}
