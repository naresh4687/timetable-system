import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, timetableAPI, expectationAPI, departmentAPI } from '../services/api';
import {
  LuUsers,
  LuCalendarDays,
  LuClipboardList,
  LuGraduationCap,
  LuUserPlus,
  LuPlus,
  LuFileText,
  LuEye,
  LuShield,
  LuInfo,
  LuBuilding2,
} from 'react-icons/lu';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, timetables: 0, expectations: 0, staff: 0, departments: 0 });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const promises = [];
        if (user.role === 'admin') {
          promises.push(
            userAPI.getAll().then(({ data }) => data.users.length),
            timetableAPI.getAll().then(({ data }) => data.timetables.length),
            expectationAPI.getAll().then(({ data }) => data.expectations.length),
            userAPI.getStaffCount().then(({ data }) => {
              console.log('API Response (staff-count):', data);
              return data.count;
            }),
            timetableAPI.getAll().then(({ data }) => {
              const feedbacks = data.timetables
                .filter((t) => t.status === 'approved' || t.status === 'rejected')
                .slice(0, 5);
              setRecentFeedback(feedbacks);
              return data.timetables.length;
            }),
            departmentAPI.getAll().then(({ data }) => data.length)
          );
          const [users, timetablesToIgnore, expectations, staff, timetables, departments] = await Promise.all(promises);
          console.log('Dashboard stats loaded:', { users, staff, timetables, expectations, departments });
          setStats({ users, timetables, expectations, staff, departments });
        } else {
          const { data } = await timetableAPI.getAll();
          setStats((s) => ({ ...s, timetables: data.timetables.length }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.role]);

  const adminStats = [
    { label: 'Total Users', value: stats.users, icon: LuUsers, color: '#2563eb', bg: '#eff6ff', to: '/users' },
    { label: 'Departments', value: stats.departments, icon: LuBuilding2, color: '#0891b2', bg: '#ecfeff', to: '/departments' },
    { label: 'Timetables', value: stats.timetables, icon: LuCalendarDays, color: '#16a34a', bg: '#f0fdf4', to: '/timetables' },
    { label: 'Subject Expectations', value: stats.expectations, icon: LuClipboardList, color: '#d97706', bg: '#fffbeb', to: '/expectations' },
    { label: 'Staff Members', value: stats.staff, icon: LuGraduationCap, color: '#7c3aed', bg: '#f5f3ff', to: '/users?role=staff' },
  ];

  const quickActions = {
    admin: [
      { label: 'Add New User', icon: LuUserPlus, to: '/users', desc: 'Create staff or manager accounts', color: '#2563eb', bg: '#eff6ff' },
      { label: 'Manage Departments', icon: LuBuilding2, to: '/departments', desc: 'Add or remove departments', color: '#0891b2', bg: '#ecfeff' },
      { label: 'Create Timetable', icon: LuPlus, to: '/timetables/new', desc: 'Build a new schedule', color: '#16a34a', bg: '#f0fdf4' },
      { label: 'View Expectations', icon: LuClipboardList, to: '/expectations', desc: 'Staff subject preferences', color: '#d97706', bg: '#fffbeb' },
    ],
    manager: [
      { label: 'View Timetables', icon: LuCalendarDays, to: '/timetables', desc: 'Manage and approve schedules', color: '#2563eb', bg: '#eff6ff' },
      { label: 'View Staff', icon: LuGraduationCap, to: '/staff', desc: 'Browse staff members', color: '#7c3aed', bg: '#f5f3ff' },
    ],
    staff: [
      { label: 'Submit Preferences', icon: LuFileText, to: '/preferences', desc: 'Select preferred subjects', color: '#2563eb', bg: '#eff6ff' },
      { label: 'View Timetable', icon: LuCalendarDays, to: '/timetables', desc: 'See your schedule', color: '#16a34a', bg: '#f0fdf4' },
    ],
    student: [
      { label: 'View Timetable', icon: LuCalendarDays, to: '/timetables', desc: 'See class schedule', color: '#2563eb', bg: '#eff6ff' },
    ],
  };

  const actions = quickActions[user.role] || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            {user.department ? ` · ${user.department}` : ''}
          </p>
        </div>
        <span className={`badge badge-${user.role}`}>{user.role}</span>
      </div>

      {/* Stats (admin only) */}
      {user.role === 'admin' && !loading && (
        <div className="stats-grid">
          {adminStats.map((s) => (
            <div
              key={s.label}
              className="stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(s.to)}
            >
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                <s.icon size={22} />
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timetable count for others */}
      {user.role !== 'admin' && !loading && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <LuCalendarDays size={22} />
            </div>
            <div>
              <div className="stat-label">Active Timetables</div>
              <div className="stat-value">{stats.timetables}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid-3" style={{ gap: '0.85rem' }}>
          {actions.map((a) => (
            <button
              key={a.label}
              className="quick-action-card"
              onClick={() => navigate(a.to)}
            >
              <div className="quick-action-icon" style={{ background: a.bg, color: a.color }}>
                <a.icon size={20} />
              </div>
              <div className="quick-action-label">{a.label}</div>
              <div className="quick-action-desc">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Admin Recent Feedback Notifications */}
      {user.role === 'admin' && recentFeedback.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            <LuClipboardList className="section-icon" />
            Recent Timetable Feedback
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recentFeedback.map((tt) => (
              <div key={tt._id} style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: '#f8fafc',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{tt.title}</div>
                  <span className={`badge badge-${tt.status}`}>
                    {tt.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-muted mb-1">{tt.department}</div>
                {tt.status === 'rejected' && tt.rejectionReason && (
                  <div className="alert alert-error" style={{ padding: '0.5rem 0.75rem', marginTop: '0.5rem', marginBottom: 0, fontSize: '0.82rem' }}>
                    <strong>Reason:</strong> {tt.rejectionReason}
                  </div>
                )}
                <div style={{ marginTop: '0.65rem', textAlign: 'right' }}>
                  <button className="btn btn-info btn-sm" onClick={() => navigate(`/timetables/${tt._id}`)}>
                    <LuEye size={14} />
                    View Timetable
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role info card */}
      <div className="role-banner">
        <LuShield size={18} />
        <div>
          <strong>Your Role: {user.role.toUpperCase()}</strong> ·{' '}
          {user.role === 'admin' && 'You have full system access including user management and timetable control.'}
          {user.role === 'manager' && 'You can view staff workloads and formally approve or reject drafted timetables.'}
          {user.role === 'staff' && 'Submit your subject preferences and view your assigned timetable.'}
          {user.role === 'student' && 'You have read-only access to view and download timetables.'}
        </div>
      </div>
    </div>
  );
}
