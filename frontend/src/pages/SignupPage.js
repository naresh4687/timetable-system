import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuGraduationCap, LuMail, LuLock, LuUser, LuEye, LuEyeOff, LuUserPlus } from 'react-icons/lu';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      <div className="login-card" style={{ maxWidth: '450px' }}>
        <div className="login-logo">
          <span className="icon"><LuGraduationCap size={40} /></span>
          <h1>TimeTable System</h1>
          <p>Create an Account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <div style={inputWrapStyle}>
              <span style={iconLeftStyle}><LuUser size={16} /></span>
              <input type="text" name="name" placeholder="John Doe" value={formData.name}
                onChange={handleChange} required autoFocus style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={inputWrapStyle}>
              <span style={iconLeftStyle}><LuMail size={16} /></span>
              <input type="email" name="email" placeholder="you@school.edu" value={formData.email}
                onChange={handleChange} required style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={inputWrapStyle}>
              <span style={iconLeftStyle}><LuLock size={16} /></span>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter password"
                value={formData.password} onChange={handleChange} required minLength={6}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }} />
              <button type="button" style={eyeBtnStyle} onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="form-group">
            <label>Department (Optional)</label>
            <input type="text" name="department" placeholder="e.g. AD&DS"
              value={formData.department} onChange={handleChange} />
          </div>

          <button className="btn btn-primary btn-full btn-lg mt-2" disabled={loading}>
            {loading ? 'Registering...' : <><LuUserPlus size={18} /> Sign Up</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm">
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
