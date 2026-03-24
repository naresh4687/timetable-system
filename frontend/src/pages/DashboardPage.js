import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, timetableAPI, expectationAPI } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, timetables: 0, expectations: 0, staff: 0 });
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
            userAPI.getAllStaff ? userAPI.getAll({ role: 'staff' }).then(({ data }) => data.users.length) : Promise.resolve(0),
            timetableAPI.getAll().then(({ data }) => {
              // Extract recent feedback straight from the getAll payload
              const feedbacks = data.timetables
                .filter((t) => t.status === 'approved' || t.status === 'rejected')
                .slice(0, 5); // Take top 5 recent
              setRecentFeedback(feedbacks);
              return data.timetables.length;
            })
          );
          const [users, timetablesToIgnore, expectations, staff, timetables] = await Promise.all(promises);
          setStats({ users, timetables, expectations, staff });
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
    { label: 'Total Users', value: stats.users, icon: '👥', color: '#3b82f6', to: '/users' },
    { label: 'Timetables', value: stats.timetables, icon: '📅', color: '#10b981', to: '/timetables' },
    { label: 'Subject Expectations', value: stats.expectations, icon: '📋', color: '#f59e0b', to: '/expectations' },
    { label: 'Staff Members', value: stats.staff, icon: '👨‍🏫', color: '#8b5cf6', to: '/users?role=staff' },
  ];

  const quickActions = {
    admin: [
      { label: 'Add New User', icon: '➕', to: '/users', desc: 'Create staff or manager accounts' },
      { label: 'Create Timetable', icon: '📅', to: '/timetables/new', desc: 'Build a new schedule' },
      { label: 'View Expectations', icon: '📋', to: '/expectations', desc: 'Staff subject preferences' },
    ],
    manager: [
      { label: 'View Timetables', icon: '🗂️', to: '/timetables', desc: 'Manage and approve schedules' },
      { label: 'View Staff', icon: '👨‍🏫', to: '/staff', desc: 'Browse staff members' },
    ],
    staff: [
      { label: 'Submit Preferences', icon: '📝', to: '/preferences', desc: 'Select preferred subjects' },
      { label: 'View Timetable', icon: '📅', to: '/timetables', desc: 'See your schedule' },
    ],
    student: [
      { label: 'View Timetable', icon: '📅', to: '/timetables', desc: 'See class schedule' },
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
              <div className="stat-icon" style={{ background: `${s.color}20` }}>
                {s.icon}
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
            <div className="stat-icon">📅</div>
            <div>
              <div className="stat-label">Active Timetables</div>
              <div className="stat-value">{stats.timetables}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title mb-2">Quick Actions</h2>
        <div className="grid-3" style={{ gap: '0.75rem' }}>
          {actions.map((a) => (
            <button
              key={a.label}
              className="card"
              style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)', padding: '1rem' }}
              onClick={() => navigate(a.to)}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{a.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{a.label}</div>
              <div className="text-muted text-sm">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Admin Recent Feedback Notifications */}
      {user.role === 'admin' && recentFeedback.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <h2 className="card-title mb-2">Recent Timetable Feedback</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {recentFeedback.map((tt) => (
              <div key={tt._id} style={{ padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{tt.title}</div>
                  <span className={`badge badge-${tt.status}`}>
                    {tt.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-muted mb-1">🏛️ {tt.department}</div>
                {tt.status === 'rejected' && tt.rejectionReason && (
                  <div className="alert alert-error text-sm" style={{ padding: '0.5rem', marginTop: '0.5rem' }}>
                    <strong>Reason:</strong> {tt.rejectionReason}
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                   <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/timetables/${tt._id}`)}>
                     View Timetable
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role info card */}
      <div className="alert alert-info">
        <strong>Your Role: {user.role.toUpperCase()}</strong> · {' '}
        {user.role === 'admin' && 'You have full system access including user management and timetable control.'}
        {user.role === 'manager' && 'You can view staff workloads and formally approve or reject drafted timetables.'}
        {user.role === 'staff' && 'Submit your subject preferences and view your assigned timetable.'}
        {user.role === 'student' && 'You have read-only access to view and download timetables.'}
      </div>
    </div>
  );
}
