import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const inputWrapStyle = { position: 'relative', display: 'flex', alignItems: 'center' };
const eyeBtnStyle = {
  position: 'absolute', right: '0.75rem', background: 'none', border: 'none',
  cursor: 'pointer', color: 'var(--text-muted, #9ca3af)', display: 'flex', alignItems: 'center',
  padding: '0', lineHeight: 1,
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setFailedAttempts(0);
      navigate('/dashboard');
    } catch (err) {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <span className="icon">🎓</span>
          <h1>TimeTable System</h1>
          <p>Academic Scheduling Platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {failedAttempts >= 3 && (
          <div className="alert alert-warning" style={{ marginBottom: '0.75rem' }}>
            Too many failed attempts.{' '}
            <Link
              to="/forgot-password"
              style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              Forgot your password?
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={inputWrapStyle}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem', width: '100%' }}
              />
              <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm">
            Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign up here</Link>
          </p>
          {failedAttempts > 0 && failedAttempts < 3 && (
            <p className="text-muted text-sm" style={{ marginTop: '0.5rem', color: 'var(--warning, #f59e0b)' }}>
              Failed attempt {failedAttempts}/3 — forgot password link appears after 3 tries.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
