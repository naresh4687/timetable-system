import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: '📊', to: '/dashboard' },
    { section: 'Management' },
    { label: 'Manage Users', icon: '👥', to: '/users' },
    { label: 'Timetables', icon: '📅', to: '/timetables' },
    { label: 'Subject Expectations', icon: '📋', to: '/expectations' },
  ],
  manager: [
    { label: 'Dashboard', icon: '📊', to: '/dashboard' },
    { section: 'Curriculum' },
    { label: 'Curriculum', icon: '📘', to: '/curriculum' },
    { section: 'Timetable' },
    { label: 'Timetables', icon: '📅', to: '/timetables' },
    { label: 'Create Timetable', icon: '➕', to: '/timetables/new' },
    { section: 'Staff' },
    { label: 'Staff List', icon: '👨‍🏫', to: '/staff' },
  ],
  staff: [
    { label: 'Dashboard', icon: '📊', to: '/dashboard' },
    { section: 'My Work' },
    { label: 'View Timetable', icon: '📅', to: '/timetables' },
    { label: 'Subject Preferences', icon: '📝', to: '/preferences' },
  ],
  student: [
    { label: 'View Timetable', icon: '📅', to: '/timetables' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🎓 TimeTable</h1>
        <span>Allocation System</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <p>{user?.name}</p>
          <span>{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section-label">{item.section}</div>
          ) : (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link btn-danger" onClick={handleLogout} style={{ color: '#ef4444' }}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
