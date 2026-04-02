import { useState, useEffect, useRef } from 'react';
import { userAPI, departmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Selecto from 'react-selecto';
import { LuUserPlus, LuPencil, LuTrash2, LuSearch, LuX, LuPlus, LuUsers } from 'react-icons/lu';

const ROLES = ['manager', 'staff', 'student'];

function UserModal({ user, departments, onClose, onSave }) {
  const [form, setForm] = useState(
    user || { name: '', email: '', password: '', role: 'staff', department: '', subjects: [] }
  );
  const [subjectInput, setSubjectInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user && !form.department && departments.length > 0) {
      setForm((f) => ({ ...f, department: departments[0].name }));
    }
  }, [departments, user, form.department]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const addSubject = () => {
    const s = subjectInput.trim();
    if (s && !form.subjects.includes(s)) {
      setForm((f) => ({ ...f, subjects: [...f.subjects, s] }));
      setSubjectInput('');
    }
  };

  const removeSubject = (s) => setForm((f) => ({ ...f, subjects: f.subjects.filter((x) => x !== s) }));

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user) {
        await userAPI.update(user._id, form);
        toast.success('User updated!');
      } else {
        await userAPI.create(form);
        toast.success('User created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{user ? 'Edit User' : 'Create New User'}</h3>
          <button className="modal-close" onClick={onClose}><LuX size={20} /></button>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="Dr. John Smith" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="user@school.edu" value={form.email} onChange={set('email')} />
          </div>
        </div>

        {!user && (
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} />
          </div>
        )}

        <div className="grid-2">
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={set('role')}>
              {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <select value={form.department} onChange={set('department')}>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {form.role === 'staff' && (
          <div className="form-group">
            <label>Subjects</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                placeholder="Add subject..."
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubject()}
              />
              <button className="btn btn-secondary btn-sm" onClick={addSubject}>
                <LuPlus size={14} /> Add
              </button>
            </div>
            <div className="tags-wrap">
              {form.subjects.map((s) => (
                <span key={s} className="tag">
                  {s}
                  <button onClick={() => removeSubject(s)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex-gap mt-2" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [departments, setDepartments] = useState([]);

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const tableContainerRef = useRef(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, depsRes] = await Promise.all([
        userAPI.getAll(filterRole ? { role: filterRole } : {}),
        departmentAPI.getAll()
      ]);
      setUsers(usersRes.data.users);
      setDepartments(depsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); setSelectedUsers([]); }, [filterRole]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filtered.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.includes(currentUser?._id)) {
      toast.error('You cannot delete your own account.');
      return;
    }
    const count = selectedUsers.length;
    if (!window.confirm(`Are you sure you want to delete ${count} user(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      const { data } = await userAPI.bulkDelete(selectedUsers);
      toast.success(data.message);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const clearSelection = () => setSelectedUsers([]);

  const allSelected = filtered.length > 0 && filtered.every((u) => selectedUsers.includes(u._id));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Create and manage system accounts</p>
        </div>
        <div className="action-buttons">
          {isAdmin && selectedUsers.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={clearSelection}>
                <LuX size={16} /> Clear Selection
              </button>
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
              >
                <LuTrash2 size={16} />
                {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedUsers.length})`}
              </button>
            </>
          )}
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            <LuUserPlus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Selection info bar */}
      {isAdmin && selectedUsers.length > 0 && (
        <div className="selecto-info-bar">
          <span>{selectedUsers.length} user(s) selected</span>
          <span className="text-muted text-sm">&nbsp;— Hold <kbd>Shift</kbd> to add to selection · Click to toggle · Drag to select multiple</span>
        </div>
      )}

      <div className="filter-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <LuSearch size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 240, paddingLeft: '2.25rem' }}
          />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      <div className="table-wrap selecto-area" ref={tableContainerRef}>
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span className="icon"><LuUsers size={40} /></span><p>No users found.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                {isAdmin && (
                  <th style={{ width: 40, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      title="Select all"
                      style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                  </th>
                )}
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u._id}
                  className={`selectable-user ${selectedUsers.includes(u._id) ? 'selected' : ''}`}
                  data-id={u._id}
                >
                  {isAdmin && (
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => handleSelectUser(u._id)}
                        style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--primary)' }}
                      />
                    </td>
                  )}
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.72rem' }}>
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.department || '—'}</td>
                  <td>
                    <span className={u.isActive ? 'status-active' : 'status-inactive'}>
                      ● {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal(u)} title="Edit">
                        <LuPencil size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id, u.name)} title="Delete">
                        <LuTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Selecto drag-select — admin only */}
      {isAdmin && !loading && filtered.length > 0 && (
        <Selecto
          container={tableContainerRef.current}
          dragContainer={tableContainerRef.current}
          selectableTargets={['.selectable-user']}
          hitRate={0}
          selectByClick={false}
          selectFromInside={false}
          toggleContinueSelect={'shift'}
          ratio={0}
          onSelect={(e) => {
            setSelectedUsers((prev) => {
              const next = new Set(prev);
              e.added.forEach((el) => {
                const id = el.getAttribute('data-id');
                if (id) next.add(id);
              });
              e.removed.forEach((el) => {
                const id = el.getAttribute('data-id');
                if (id) next.delete(id);
              });
              return Array.from(next);
            });
          }}
        />
      )}

      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal}
          departments={departments}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchUsers(); }}
        />
      )}
    </div>
  );
}
