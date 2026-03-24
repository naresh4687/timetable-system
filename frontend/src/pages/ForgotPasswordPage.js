import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      setResetToken(res.data.resetToken || '');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <span className="icon">🔑</span>
          <h1>Forgot Password</h1>
          <p>Enter your email to get a reset token</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {submitted ? (
          <div>
            <div className="alert alert-success" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              ✅ Reset token generated successfully!
            </div>

            {resetToken && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #9ca3af)', marginBottom: '0.5rem' }}>
                  📋 Your reset token (copy this):
                </p>
                <code style={{
                  display: 'block',
                  wordBreak: 'break-all',
                  fontSize: '0.78rem',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  color: '#a78bfa',
                  userSelect: 'all',
                }}>
                  {resetToken}
                </code>
                <button
                  className="btn btn-primary btn-full mt-2"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(resetToken);
                  }}
                >
                  📋 Copy Token
                </button>
              </div>
            )}

            <Link
              to={resetToken ? `/reset-password/${resetToken}` : '/reset-password/'}
              className="btn btn-primary btn-full"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Reset Password →
            </Link>
          </div>
        ) : (
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
            <button className="btn btn-primary btn-full btn-lg mt-2" disabled={loading}>
              {loading ? 'Generating...' : 'Get Reset Token →'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm">
            Remembered it?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
