import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarDays,
  LuClipboardCheck,
  LuBookOpen,
  LuCircleCheck,
  LuPlus,
  LuGraduationCap,
  LuFileText,
  LuBuilding2,
  LuCircleUser,
} from 'react-icons/lu';

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: LuLayoutDashboard, to: '/dashboard' },
    { section: 'Management' },
    { label: 'Manage Departments', icon: LuBuilding2, to: '/departments' },
    { label: 'Manage Users', icon: LuUsers, to: '/users' },
    { label: 'Subject Allocated', icon: LuCircleCheck, to: '/assignments' },
    { label: 'Timetables', icon: LuCalendarDays, to: '/timetables' },
    { label: 'Subject Expectations', icon: LuClipboardCheck, to: '/expectations' },
    { section: 'Account' },
    { label: 'My Profile', icon: LuCircleUser, to: '/profile' },
  ],
  manager: [
    { label: 'Dashboard', icon: LuLayoutDashboard, to: '/dashboard' },
    { section: 'Curriculum' },
    { label: 'Curriculum', icon: LuBookOpen, to: '/curriculum' },
    { section: 'Timetable' },
    { label: 'Subject Allocated', icon: LuCircleCheck, to: '/assignments' },
    { label: 'Timetables', icon: LuCalendarDays, to: '/timetables' },
    { label: 'Create Timetable', icon: LuPlus, to: '/timetables/new' },
    { section: 'Staff' },
    { label: 'Staff List', icon: LuGraduationCap, to: '/staff' },
    { section: 'Account' },
    { label: 'My Profile', icon: LuCircleUser, to: '/profile' },
  ],
  staff: [
    { label: 'Dashboard', icon: LuLayoutDashboard, to: '/dashboard' },
    { section: 'My Work' },
    { label: 'View Timetable', icon: LuCalendarDays, to: '/timetables' },
    { label: 'Subject Preferences', icon: LuFileText, to: '/preferences' },
    { section: 'Account' },
    { label: 'My Profile', icon: LuCircleUser, to: '/profile' },
  ],
  student: [
    { label: 'View Timetable', icon: LuCalendarDays, to: '/timetables' },
    { section: 'Account' },
    { label: 'My Profile', icon: LuCircleUser, to: '/profile' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = navConfig[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <LuGraduationCap />
        </div>
        <div className="sidebar-logo-text">
          <h1>TimeTable</h1>
          <span>Allocation System</span>
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
              <span className="nav-icon">
                <item.icon size={18} />
              </span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}
