import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuGraduationCap, LuLogOut } from 'react-icons/lu';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="navbar-title">
        <LuGraduationCap className="college-icon" />
        TimeTable Allocation System
      </div>

      <div className="navbar-right">
        <div 
          className="navbar-user" 
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
          title="Go to Profile"
        >
          <div>
            <div className="navbar-user-name">{user?.name}</div>
            <div className="navbar-user-role">{user?.role}</div>
          </div>
          <div className="navbar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <button className="navbar-logout" onClick={handleLogout}>
          <LuLogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
