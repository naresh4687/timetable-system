import { useState, useEffect } from 'react';
import { userAPI, departmentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { LuUserPlus, LuPencil, LuTrash2, LuSearch, LuX, LuGraduationCap, LuSave, LuCheck } from 'react-icons/lu';

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
  const [departments, setDepartments] = useState([]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [staffRes, depsRes] = await Promise.all([
        userAPI.getAll({ role: 'staff' }),
        departmentAPI.getAll()
      ]);
      setStaff(staffRes.data.users);
      setDepartments(depsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openCreate = () => { 
    const defaultDep = departments[0]?.name || '';
    setForm({ ...emptyForm(), department: defaultDep });
    setEditingId(null); 
    setShowModal(true); 
  };
  const openEdit = (s) => {
    setForm({
      name: s.name, email: s.email, password: '', department: s.department || '',
      role: s.role, handledSemesters: s.handledSemesters || [], isActive: s.isActive,
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
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!editingId && !form.password) { toast.error('Password is required for new staff'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
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
    try { await userAPI.delete(id); toast.success('Staff removed'); fetchStaff(); }
    catch { toast.error('Delete failed'); }
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
        <button className="btn btn-primary" onClick={openCreate}>
          <LuUserPlus size={16} /> Add Staff
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <LuSearch size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 300, paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><span className="icon"><LuGraduationCap size={40} /></span><p>No staff found.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {filtered.map((s) => (
            <div key={s._id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                <div className="user-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                  {s.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{s.name}</div>
                  <div className="text-muted text-sm">{s.email}</div>
                </div>
                <div className="action-buttons">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)} style={{ padding: '0.3rem 0.5rem' }}>
                    <LuPencil size={14} />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)} style={{ padding: '0.3rem 0.5rem' }}>
                    <LuTrash2 size={14} />
                  </button>
                </div>
              </div>

              {s.department && (
                <div className="text-sm" style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  {s.department}
                </div>
              )}

              {s.handledSemesters?.length > 0 && (
                <div style={{ marginTop: '0.35rem' }}>
                  <div className="text-muted text-sm" style={{ marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Semesters:</div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {s.handledSemesters.map((sem) => (
                      <span key={sem} className="badge badge-theory">Sem {sem}</span>
                    ))}
                  </div>
                </div>
              )}

              {!s.isActive && (
                <span className="badge badge-rejected" style={{ marginTop: '0.5rem' }}>Inactive</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Staff' : 'New Staff Member'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><LuX size={20} /></button>
            </div>

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
                <select 
                  value={form.department} 
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Assigned Semesters <span className="text-muted text-sm">(staff will only see these semesters in their preference form)</span></label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                  const selected = form.handledSemesters.includes(sem);
                  return (
                    <button
                      key={sem} type="button" onClick={() => toggleSemester(sem)}
                      style={{
                        padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        border: selected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                        background: selected ? 'var(--primary-light)' : 'var(--bg)',
                        color: selected ? 'var(--primary)' : 'var(--text-muted)',
                        transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none' }}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  Active Account
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
