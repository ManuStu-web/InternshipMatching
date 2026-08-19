import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CandidateLayout from './components/CandidateLayout';
import DashboardPage from './pages/candidate/DashboardPage';
import ProfilePage from './pages/candidate/ProfilePage';
import ResumePage from './pages/candidate/ResumePage';
import InternshipsPage from './pages/candidate/InternshipsPage';

const THEME_KEY = 'internsetu-theme';

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch (error) {
    // Ignore storage errors and fall back to the system preference.
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function GovernmentDashboard() {
  const { session, logout } = useAuth();

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow dark"><span /> GOVERNMENT PORTAL</span>
            <h2>{session.user?.department || 'Government Office'}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={logout}>Logout</button>
        </div>
        <div className="metrics-grid">
          <div className="metric-tile">
            <span>Role</span>
            <strong>{session.user?.role}</strong>
          </div>
          <div className="metric-tile">
            <span>Email</span>
            <strong>{session.user?.email}</strong>
          </div>
          <div className="metric-tile">
            <span>Status</span>
            <strong>Authorized</strong>
          </div>
        </div>
        <p className="dashboard-note">Government flows are connected to the real backend with admin/officer authorization checks.</p>
      </div>
    </div>
  );
}

function CandidatePortal({ route, onNavigate, theme, onThemeToggle }) {
  const pages = {
    '/candidate/dashboard': <DashboardPage onNavigate={onNavigate} />,
    '/candidate/profile': <ProfilePage onNavigate={onNavigate} />,
    '/candidate/resume': <ResumePage onNavigate={onNavigate} />,
    '/candidate/internships': <InternshipsPage onNavigate={onNavigate} />,
  };

  return (
    <CandidateLayout activePath={route} onNavigate={onNavigate} theme={theme} onThemeToggle={onThemeToggle}>
      {pages[route] || pages['/candidate/dashboard']}
    </CandidateLayout>
  );
}

function AppContent() {
  const { session } = useAuth();
  const [route, setRoute] = useState('/candidate/dashboard');
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // Ignore storage write issues in restricted environments.
    }
  }, [theme]);

  useEffect(() => {
    if (!session || !session.token) {
      setRoute('/candidate/dashboard');
      return;
    }

    if (session.user?.role !== 'candidate') {
      setRoute('/candidate/dashboard');
    }
  }, [session]);

  if (!session || !session.token) {
    return <AuthPage />;
  }

  if (session.user?.role === 'candidate') {
    return <CandidatePortal route={route} onNavigate={setRoute} theme={theme} onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />;
  }

  if (session.user?.role === 'admin' || session.user?.role === 'officer') {
    return <GovernmentDashboard />;
  }

  return <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;