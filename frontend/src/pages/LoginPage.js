import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuGraduationCap, LuMail, LuLock, LuEye, LuEyeOff, LuLogIn } from 'react-icons/lu';

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
          <span className="icon"><LuGraduationCap size={40} /></span>
          <h1>TimeTable System</h1>
          <p>Academic Scheduling Platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {failedAttempts >= 3 && (
          <div className="alert alert-warning" style={{ marginBottom: '0.75rem' }}>
            Too many failed attempts.{' '}
            <Link to="/forgot-password" style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}>
              Forgot your password?
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={inputWrapStyle}>
              <span style={iconLeftStyle}><LuMail size={16} /></span>
              <input
                type="email" placeholder="you@school.edu" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoFocus
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={inputWrapStyle}>
              <span style={iconLeftStyle}><LuLock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'} placeholder="Enter password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }}
              />
              <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg mt-2" disabled={loading}>
            {loading ? 'Signing in...' : <><LuLogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm">
            Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign up here</Link>
          </p>
          {failedAttempts > 0 && failedAttempts < 3 && (
            <p className="text-muted text-sm" style={{ marginTop: '0.5rem', color: 'var(--warning)' }}>
              Failed attempt {failedAttempts}/3 — forgot password link appears after 3 tries.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
