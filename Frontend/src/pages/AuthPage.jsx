import { useState } from 'react';
import { candidateLogin, candidateRegister, governmentLogin } from '../services/api2';
import { useAuth } from '../context/AuthContext';

const initialLogin = {
  identity: '',
  password: '',
};

const initialGovernmentLogin = {
  email: '',
  password: '',
};

const initialRegister = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

function Field({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, required = true, error, suffix }) {
  return (
    <div className="field-wrap">
      <label htmlFor={id}>{label}</label>
      <div className={`field ${error ? 'field-error' : ''}`}>
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
        />
        {suffix}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

function EyeIcon({ show }) {
  return show ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3L21 21" />
      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
      <path d="M9.88 5.71A9.73 9.73 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.55 16.55 0 0 1-4.35 5.1" />
      <path d="M6.68 6.68A16.8 16.8 0 0 0 2.5 12s3.5 6.5 9.5 6.5a10.18 10.18 0 0 0 5.06-1.45" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.45-1.28a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.4-2.7 8.4-7 10-4.3-1.6-7-5.6-7-10V6l7-3Z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5 9.5 17 19 7.5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function AuthPage() {
  const { login } = useAuth();
  const [accountType, setAccountType] = useState('candidate');
  const [mode, setMode] = useState('login');
  const [loginValues, setLoginValues] = useState(initialLogin);
  const [governmentLoginValues, setGovernmentLoginValues] = useState(initialGovernmentLogin);
  const [registerValues, setRegisterValues] = useState(initialRegister);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isCandidate = accountType === 'candidate';
  const isLogin = mode === 'login';

  const switchAccountType = (nextType) => {
    setAccountType(nextType);
    setMode(nextType === 'candidate' ? 'login' : 'login');
    setErrors({});
    setNotice('');
    setShowPassword(false);
  };

  const switchMode = (nextMode) => {
    if (!isCandidate) return;
    setMode(nextMode);
    setErrors({});
    setNotice('');
    setShowPassword(false);
  };

  const setValue = (setter, key) => (event) => {
    setter((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const validateCandidate = (values) => {
    const next = {};

    if (!isLogin && values.name.trim().length < 2) {
      next.name = 'Please enter your full name.';
    }

    if (isLogin ? values.identity.trim().length < 3 : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next[isLogin ? 'identity' : 'email'] = isLogin ? 'Enter your username or email.' : 'Enter a valid email address.';
    }

    if (!isLogin && !/^\+?[0-9\s-]{10,}$/.test(values.phone)) {
      next.phone = 'Enter a valid phone number.';
    }

    if (values.password.length < 6) {
      next.password = isLogin ? 'Use at least 6 characters.' : 'Use at least 6 characters.';
    }

    return next;
  };

  const validateGovernment = (values) => {
    const next = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'Enter a valid email address.';
    }

    if (values.password.length < 6) {
      next.password = 'Use at least 6 characters.';
    }

    return next;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (isCandidate) {
      const values = isLogin ? loginValues : registerValues;
      const nextErrors = validateCandidate(values);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length) {
        return;
      }

      setLoading(true);
      setNotice('');

      try {
        const response = isLogin
          ? await candidateLogin({ email: loginValues.identity, password: loginValues.password })
          : await candidateRegister({
              name: registerValues.name,
              email: registerValues.email,
              phone: registerValues.phone,
              password: registerValues.password,
            });

        if (isLogin) {
          login(response);
          setNotice('Candidate login successful.');
        } else {
          setNotice('Candidate registration successful. Please sign in.');
          setMode('login');
          setLoginValues({ ...loginValues, identity: registerValues.email, password: '' });
          setRegisterValues(initialRegister);
        }
      } catch (error) {
        setNotice(error.message || 'Authentication failed.');
      } finally {
        setLoading(false);
      }

      return;
    }

    const nextErrors = validateGovernment(governmentLoginValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setLoading(true);
    setNotice('');

    try {
      const response = await governmentLogin({
        email: governmentLoginValues.email,
        password: governmentLoginValues.password,
      });

      login(response);
      setNotice('Government login successful.');
    } catch (error) {
      setNotice(error.message || 'Government login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="story-panel" aria-label="InternSetu introduction">
        <div className="story-art" />
        <div className="grain" />

        <header className="brand-lockup">
          <span className="brand-emblem" aria-hidden="true"><span /></span>
          <span><strong>Intern</strong>Setu</span>
        </header>

        <div className="story-copy">
          <p className="eyebrow"><span /> PM INTERNSHIP SCHEME</p>
          <h1>Do more.<br /><em>For Bharat.</em></h1>
          <p className="story-lede">AI-powered internship matching and allocation for India’s youth.</p>
          <div className="story-points">
            <span><CheckIcon /> Learn by doing</span>
            <span><CheckIcon /> Serve with purpose</span>
          </div>
        </div>

        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />

        <p className="story-footer">जुड़ें • सीखें • योगदान दें<span>JOIN · LEARN · CONTRIBUTE</span></p>
      </section>

      <section className="form-panel">
        <div className="form-topline">
          <span className="mini-seal"><ShieldIcon /></span>
          <span>Trusted access</span>
          <span className="top-dot" />
          <span>For India’s youth</span>
        </div>

        <div className={`form-inner mode-${isLogin ? 'login' : 'register'}`}>
          <div className="mobile-brand">
            <span className="brand-emblem"><span /></span>
            <span><strong>Intern</strong>Setu</span>
          </div>

          <div className="account-switch" role="tablist" aria-label="Account type">
            <button type="button" className={isCandidate ? 'active' : ''} onClick={() => switchAccountType('candidate')} aria-selected={isCandidate}>Candidate</button>
            <button type="button" className={!isCandidate ? 'active' : ''} onClick={() => switchAccountType('government')} aria-selected={!isCandidate}>Government</button>
          </div>

          <div className="heading-block">
            <p className="eyebrow dark"><span /> WELCOME ABOARD</p>
            <h2>{isCandidate ? (isLogin ? 'Welcome back.' : 'Start your journey.') : 'Government access.'}</h2>
            <p>
              {isCandidate
                ? (isLogin ? 'Sign in to pick up where you left off.' : 'Create your InternSetu account in a few simple steps.')
                : 'Sign in using your government credentials to manage candidates and allocations.'}
            </p>
          </div>

          {isCandidate && (
            <div className="mode-switch" role="tablist" aria-label="Account access">
              <button type="button" role="tab" aria-selected={isLogin} className={isLogin ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
              <button type="button" role="tab" aria-selected={!isLogin} className={!isLogin ? 'active' : ''} onClick={() => switchMode('register')}>Register</button>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            {!isCandidate && (
              <Field
                id="gov-email"
                label="Government email"
                type="email"
                value={governmentLoginValues.email}
                onChange={setValue(setGovernmentLoginValues, 'email')}
                placeholder="officer@pmis.gov.in"
                icon={MailIcon}
                error={errors.email}
              />
            )}

            {isCandidate && !isLogin && (
              <Field
                id="name"
                label="Full name"
                value={registerValues.name}
                onChange={setValue(setRegisterValues, 'name')}
                placeholder="Your name as on ID"
                icon={UserIcon}
                error={errors.name}
              />
            )}

            {isCandidate && (
              <Field
                id={isLogin ? 'identity' : 'email'}
                label={isLogin ? 'Username or email' : 'Email address'}
                type={isLogin ? 'text' : 'email'}
                value={isLogin ? loginValues.identity : registerValues.email}
                onChange={setValue(isLogin ? setLoginValues : setRegisterValues, isLogin ? 'identity' : 'email')}
                placeholder={isLogin ? 'you@example.com or username' : 'you@example.com'}
                icon={MailIcon}
                error={errors[isLogin ? 'identity' : 'email']}
              />
            )}

            {isCandidate && !isLogin && (
              <Field
                id="phone"
                label="Phone number"
                type="tel"
                value={registerValues.phone}
                onChange={setValue(setRegisterValues, 'phone')}
                placeholder="+91 00000 00000"
                icon={PhoneIcon}
                error={errors.phone}
              />
            )}

            {(isCandidate || !isCandidate) && (
              <Field
                id="password"
                label={isCandidate ? 'Password' : 'Government password'}
                type={showPassword ? 'text' : 'password'}
                value={isCandidate ? (isLogin ? loginValues.password : registerValues.password) : governmentLoginValues.password}
                onChange={setValue(
                  isCandidate ? (isLogin ? setLoginValues : setRegisterValues) : setGovernmentLoginValues,
                  'password',
                )}
                placeholder="At least 6 characters"
                icon={LockIcon}
                error={errors.password}
                suffix={
                  <button className="eye-button" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <EyeIcon show={showPassword} />
                  </button>
                }
              />
            )}

            {isCandidate && isLogin && (
              <div className="form-options">
                <label className="remember">
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  <span className="checkmark"><CheckIcon /></span>
                  Remember me
                </label>
                <button type="button" className="text-link" onClick={() => setNotice('Password recovery will be available soon.')}>Forgot password?</button>
              </div>
            )}

            {isCandidate && !isLogin && (
              <label className="terms">
                <input type="checkbox" required />
                <span>I agree to the InternSetu <button type="button" className="text-link" onClick={() => setNotice('Terms and privacy details will be published soon.')}>terms and privacy policy</button>.</span>
              </label>
            )}

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : (isCandidate ? (isLogin ? 'Sign in to InternSetu' : 'Create my account') : 'Access government portal')}
              <ArrowRightIcon />
            </button>

            {notice && (
              <p className="notice" role="status"><SparkleIcon /> {notice}</p>
            )}
          </form>

          {isCandidate && (
            <>
              <div className="divider"><span>or continue with</span></div>
              <div className="social-actions">
                <button type="button" className="social-button" onClick={() => setNotice('DigiLocker access is coming soon. Please use email or Google to continue for now.')}>Continue with DigiLocker</button>
              </div>
            </>
          )}

          {isCandidate && (
            <p className="switch-copy">
              {isLogin ? 'New to InternSetu?' : 'Already have an account?'}{' '}
              <button className="text-link" type="button" onClick={() => switchMode(isLogin ? 'register' : 'login')}>
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </p>
          )}
        </div>

        <p className="legal"><ShieldIcon /> Your information is protected with secure encryption.</p>
      </section>
    </main>
  );
}

export default AuthPage;
