import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { LuShieldCheck, LuLock, LuEye, LuEyeOff, LuArrowRight } from 'react-icons/lu';

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
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
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

  const inputWrapStyle = { position: 'relative', display: 'flex', alignItems: 'center' };
  const iconLeftStyle = { position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' };
  const eyeBtnStyle = {
    position: 'absolute', right: '0.75rem', background: 'none', border: 'none',
    cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
    padding: '0', lineHeight: 1,
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <span className="icon"><LuShieldCheck size={40} /></span>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {success ? (
          <div>
            <div className="alert alert-success" style={{ textAlign: 'center' }}>
              Password reset successfully!<br />
              <small>Redirecting to login in 3 seconds…</small>
            </div>
            <Link to="/login" className="btn btn-primary btn-full" style={{ display: 'flex', textDecoration: 'none' }}>
              <LuArrowRight size={16} /> Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div style={inputWrapStyle}>
                <span style={iconLeftStyle}><LuLock size={16} /></span>
                <input type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus minLength={6}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }} />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={inputWrapStyle}>
                <span style={iconLeftStyle}><LuLock size={16} /></span>
                <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat new password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }} />
                <button type="button" style={eyeBtnStyle} onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <LuEyeOff size={18} /> : <LuEye size={18} />}
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
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              ← Request a new token
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
