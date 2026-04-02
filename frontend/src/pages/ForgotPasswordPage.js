import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { LuKeyRound, LuMail, LuCopy, LuArrowRight } from 'react-icons/lu';

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

  const iconLeftStyle = { position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <span className="icon"><LuKeyRound size={40} /></span>
          <h1>Forgot Password</h1>
          <p>Enter your email to get a reset token</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {submitted ? (
          <div>
            <div className="alert alert-success">Reset token generated successfully!</div>

            {resetToken && (
              <div style={{
                background: '#f8fafc', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.25rem',
              }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Your reset token (copy this):
                </p>
                <code style={{
                  display: 'block', wordBreak: 'break-all', fontSize: '0.78rem',
                  background: '#f1f5f9', padding: '0.6rem', borderRadius: '6px',
                  color: 'var(--primary)', userSelect: 'all', border: '1px solid var(--border)',
                }}>
                  {resetToken}
                </code>
                <button className="btn btn-secondary btn-full mt-2" style={{ fontSize: '0.85rem' }}
                  onClick={() => navigator.clipboard.writeText(resetToken)}>
                  <LuCopy size={14} /> Copy Token
                </button>
              </div>
            )}

            <Link to={resetToken ? `/reset-password/${resetToken}` : '/reset-password/'}
              className="btn btn-primary btn-full"
              style={{ display: 'flex', textDecoration: 'none' }}>
              <LuArrowRight size={16} /> Reset Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={iconLeftStyle}><LuMail size={16} /></span>
                <input type="email" placeholder="you@school.edu" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoFocus
                  style={{ paddingLeft: '2.5rem', width: '100%' }} />
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg mt-2" disabled={loading}>
              {loading ? 'Generating...' : 'Get Reset Token →'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm">
            Remembered it?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
