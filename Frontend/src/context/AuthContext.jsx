import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'sih25033-session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const login = (data) => {
    const user = data.candidate
      ? { ...data.candidate, role: 'candidate' }
      : data.government
        ? { ...data.government, role: data.government.role }
        : null;

    setSession({
      token: data.token,
      user,
    });
  };

  const logout = () => setSession(null);

  const value = useMemo(
    () => ({
      session,
      login,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
