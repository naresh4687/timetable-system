import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

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

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <span className="icon">🔒</span>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {success ? (
          <div>
            <div className="alert" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
              ✅ Password reset successfully!<br />
              <small>Redirecting to login in 3 seconds…</small>
            </div>
            <Link to="/login" className="btn btn-primary btn-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Go to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div style={inputWrapStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  minLength={6}
                  style={{ paddingRight: '2.5rem', width: '100%' }}
                />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={inputWrapStyle}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem', width: '100%' }}
                />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg mt-2" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password →'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm">
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              ← Request a new token
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
