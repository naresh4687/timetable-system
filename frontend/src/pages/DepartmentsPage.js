import { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { LuPlus, LuPencil, LuTrash2, LuBuilding, LuX, LuSearch } from 'react-icons/lu';

function DepartmentModal({ department, onClose, onSave }) {
  const [name, setName] = useState(department ? department.name : '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Department name is required');
    setLoading(true);
    try {
      if (department) {
        await departmentAPI.update(department._id, { name });
        toast.success('Department updated!');
      } else {
        await departmentAPI.create({ name });
        toast.success('Department created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{department ? 'Edit Department' : 'Create New Department'}</h3>
          <button className="modal-close" onClick={onClose}><LuX size={20} /></button>
        </div>

        <div className="form-group mb-4">
          <label>Department Name</label>
          <input
            placeholder="e.g. Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>

        <div className="flex-gap mt-2" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : department ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await departmentAPI.getAll();
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the department "${name}"?`)) return;
    try {
      await departmentAPI.delete(id);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Department Management</h1>
          <p className="page-subtitle">Manage institution departments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <LuPlus size={16} /> Add Department
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <LuSearch size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 300, paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : departments.length === 0 ? (
          <div className="empty-state">
            <span className="icon"><LuBuilding size={40} /></span>
            <p>No departments found.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dep) => (
                <tr key={dep._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.8rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <LuBuilding size={14} />
                      </div>
                      {dep.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(dep.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal(dep)} title="Edit">
                        <LuPencil size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dep._id, dep.name)} title="Delete">
                        <LuTrash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <DepartmentModal
          department={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchDepartments(); }}
        />
      )}
    </div>
  );
}
