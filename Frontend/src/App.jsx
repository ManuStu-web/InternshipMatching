import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CandidateLayout from './components/CandidateLayout';
import DashboardPage from './pages/candidate/DashboardPage';
import ProfilePage from './pages/candidate/ProfilePage';
import ResumePage from './pages/candidate/ResumePage';
import InternshipsPage from './pages/candidate/InternshipsPage';
import AllocationsPage from './pages/candidate/AllocationsPage';
import GovernmentLayout from './components/GovernmentLayout';
import GovernmentDashboardPage from './pages/government/DashboardPage';
import GovernmentInternshipsPage from './pages/government/InternshipsPage';
import GovernmentCandidatePoolPage from './pages/government/CandidatePoolPage';
import GovernmentAllocationPage from './pages/government/AllocationPage';

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



function GovernmentPortal({ route, onNavigate, theme, onThemeToggle }) {
  const pages = {
    '/government/dashboard': <GovernmentDashboardPage onNavigate={onNavigate} />,
    '/government/internships': <GovernmentInternshipsPage onNavigate={onNavigate} />,
    '/government/candidates': <GovernmentCandidatePoolPage onNavigate={onNavigate} />,
    '/government/allocations': <GovernmentAllocationPage onNavigate={onNavigate} />,
  };

  return (
    <GovernmentLayout activePath={route} onNavigate={onNavigate} theme={theme} onThemeToggle={onThemeToggle}>
      {pages[route] || <GovernmentDashboardPage onNavigate={onNavigate} />}
    </GovernmentLayout>
  );
}

function CandidatePortal({ route, onNavigate, theme, onThemeToggle }) {
  const pages = {
    '/candidate/dashboard': <DashboardPage onNavigate={onNavigate} />,
    '/candidate/profile': <ProfilePage onNavigate={onNavigate} />,
    '/candidate/resume': <ResumePage onNavigate={onNavigate} />,
    '/candidate/internships': <InternshipsPage onNavigate={onNavigate} />,
    '/candidate/allocations': <AllocationsPage onNavigate={onNavigate} />,
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

    if (session.user?.role === 'candidate' && !route.startsWith('/candidate')) {
      setRoute('/candidate/dashboard');
    } else if ((session.user?.role === 'admin' || session.user?.role === 'officer') && !route.startsWith('/government')) {
      setRoute('/government/dashboard');
    }
  }, [session, route]);

  if (!session || !session.token) {
    return <AuthPage />;
  }

  if (session.user?.role === 'candidate') {
    return <CandidatePortal route={route} onNavigate={setRoute} theme={theme} onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />;
  }

  if (session.user?.role === 'admin' || session.user?.role === 'officer') {
    return <GovernmentPortal route={route} onNavigate={setRoute} theme={theme} onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />;
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