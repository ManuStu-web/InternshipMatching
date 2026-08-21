import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    label: 'Dashboard',
    path: '/candidate/dashboard',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="4" width="7" height="16" rx="2" />
        <rect x="14" y="4" width="7" height="16" rx="2" />
      </svg>
    ),
  },
  {
    label: 'My Profile',
    path: '/candidate/profile',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Resume',
    path: '/candidate/resume',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Internships',
    path: '/candidate/internships',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    label: 'Allocations',
    path: '/candidate/allocations',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
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
        <div className="sidebar-top-section">
          {/* Brand Emblem */}
          <div className="sidebar-brand-custom">
            <div className="brand-emblem-sidebar">
              <span className="dot dot-1" />
              <span className="dot dot-2" />
              <span className="dot dot-3" />
            </div>
            <div className="brand-title-custom">
              <strong>Intern</strong>Setu
            </div>
          </div>

          <p className="sidebar-tagline-custom">
            AI-powered internship matching and allocation for India’s youth.
          </p>

          {/* Navigation List */}
          <nav className="sidebar-nav-custom" aria-label="Candidate navigation">
            {navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                className={`nav-item-custom ${activePath === item.path ? 'active' : ''}`}
                onClick={() => onNavigate(item.path)}
              >
                <span className="nav-icon-custom">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className="nav-divider-custom" />

            <button
              type="button"
              className="nav-item-custom logout-item-custom"
              onClick={logout}
            >
              <span className="nav-icon-custom">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Bottom Lotus Artwork with Orbit Ring Nodes */}
        <div className="sidebar-lotus-wrapper" aria-hidden="true">
          <svg className="lotus-svg" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lotusPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f36c3c" stopOpacity="0.75" />
                <stop offset="55%" stopColor="#f6b740" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#f36c3c" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="lotusPetalGrad2" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#f36c3c" stopOpacity="0.88" />
                <stop offset="60%" stopColor="#f6b740" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#f36c3c" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* Orbit Lines & Circular Nodes */}
            <circle cx="140" cy="220" r="160" stroke="rgba(243, 108, 60, 0.42)" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="140" cy="220" r="120" stroke="rgba(243, 108, 60, 0.35)" strokeWidth="1.2" />
            <circle cx="140" cy="220" r="80" stroke="rgba(243, 108, 60, 0.28)" strokeWidth="1.2" strokeDasharray="3 3" />

            <circle cx="48" cy="148" r="5" fill="#f6b740" opacity="0.95" />
            <circle cx="112" cy="108" r="4" fill="#f36c3c" opacity="0.9" />
            <circle cx="220" cy="118" r="4.5" fill="#f6b740" opacity="0.95" />
            <circle cx="242" cy="172" r="3.5" fill="#f36c3c" opacity="0.85" />

            {/* Lotus Flower Bloom */}
            {/* Outer Petals */}
            <path d="M140 180 C80 180 50 140 65 110 C80 140 120 170 140 180 Z" fill="url(#lotusPetalGrad)" stroke="rgba(243, 108, 60, 0.35)" strokeWidth="0.8" />
            <path d="M140 180 C200 180 230 140 215 110 C200 140 160 170 140 180 Z" fill="url(#lotusPetalGrad)" stroke="rgba(243, 108, 60, 0.35)" strokeWidth="0.8" />

            {/* Mid Petals */}
            <path d="M140 180 C95 170 80 125 95 90 C110 125 130 165 140 180 Z" fill="url(#lotusPetalGrad)" stroke="rgba(243, 108, 60, 0.4)" strokeWidth="0.8" />
            <path d="M140 180 C185 170 200 125 185 90 C170 125 150 165 140 180 Z" fill="url(#lotusPetalGrad)" stroke="rgba(243, 108, 60, 0.4)" strokeWidth="0.8" />

            {/* Inner Petals */}
            <path d="M140 180 C115 160 110 110 120 75 C130 110 135 160 140 180 Z" fill="url(#lotusPetalGrad2)" stroke="rgba(243, 108, 60, 0.45)" strokeWidth="0.8" />
            <path d="M140 180 C165 160 170 110 160 75 C150 110 145 160 140 180 Z" fill="url(#lotusPetalGrad2)" stroke="rgba(243, 108, 60, 0.45)" strokeWidth="0.8" />

            {/* Center Main Petal */}
            <path d="M140 180 C128 150 128 95 140 60 C152 95 152 150 140 180 Z" fill="url(#lotusPetalGrad2)" stroke="rgba(243, 108, 60, 0.5)" strokeWidth="0.8" />
          </svg>
        </div>
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

