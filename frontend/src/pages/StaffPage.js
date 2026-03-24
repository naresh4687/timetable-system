import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const emptyForm = () => ({
  name: '',
  email: '',
  password: '',
  department: '',
  role: 'staff',
  handledSemesters: [],
  isActive: true,
});

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchStaff = () => {
    setLoading(true);
    userAPI.getAll({ role: 'staff' })
      .then(({ data }) => setStaff(data.users))
      .catch(() => toast.error('Failed to load staff'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      email: s.email,
      password: '',
      department: s.department || '',
      role: s.role,
      handledSemesters: s.handledSemesters || [],
      isActive: s.isActive,
    });
    setEditingId(s._id);
    setShowModal(true);
  };

  const toggleSemester = (sem) => {
    setForm((f) => {
      const exists = f.handledSemesters.includes(sem);
      return {
        ...f,
        handledSemesters: exists
          ? f.handledSemesters.filter((s) => s !== sem)
          : [...f.handledSemesters, sem].sort((a, b) => a - b),
      };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!editingId && !form.password) {
      toast.error('Password is required for new staff');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't send empty password on edit

      if (editingId) {
        await userAPI.update(editingId, payload);
        toast.success('Staff updated!');
      } else {
        await userAPI.create(payload);
        toast.success('Staff created!');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await userAPI.delete(id);
      toast.success('Staff removed');
      fetchStaff();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Directory</h1>
          <p className="page-subtitle">{staff.length} staff members</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>➕ Add Staff</button>
      </div>

      <div className="filter-bar">
        <input
          placeholder="🔍 Search by name, email, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 280 }}
        />
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><span className="icon">👨‍🏫</span><p>No staff found.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map((s) => (
            <div key={s._id} className="card">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                <div className="user-avatar" style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0 }}>
                  {s.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div className="text-muted text-sm">{s.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)} style={{ padding: '0.25rem 0.6rem' }}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)} style={{ padding: '0.25rem 0.6rem' }}>🗑️</button>
                </div>
              </div>

              {s.department && (
                <div className="text-sm" style={{ marginBottom: '0.5rem' }}>🏛️ {s.department}</div>
              )}

              {s.handledSemesters?.length > 0 && (
                <div style={{ marginTop: '0.35rem' }}>
                  <div className="text-muted text-sm" style={{ marginBottom: '0.25rem' }}>Semesters:</div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {s.handledSemesters.map((sem) => (
                      <span key={sem} className="badge badge-theory" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>Sem {sem}</span>
                    ))}
                  </div>
                </div>
              )}

              {!s.isActive && (
                <span className="badge" style={{ marginTop: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '0.2rem 0.5rem' }}>Inactive</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: 'var(--card)', borderRadius: 16, padding: '2rem',
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? '✏️ Edit Staff' : '➕ New Staff Member'}</h2>

            <div className="grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dr. John Doe" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="john@school.edu" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>{editingId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} placeholder="AD & DS" />
              </div>
            </div>

            {/* Handled Semesters Selector */}
            <div className="form-group">
              <label>Assigned Semesters <span className="text-muted text-sm">(staff will only see these semesters in their preference form)</span></label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                  const selected = form.handledSemesters.includes(sem);
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => toggleSemester(sem)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: 8,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: selected ? 'var(--accent-glow)' : 'var(--bg)',
                        color: selected ? 'var(--accent)' : 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                    >
                      Sem {sem}
                    </button>
                  );
                })}
              </div>
            </div>

            {editingId && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Active Account
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? '💾 Update' : '✅ Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
