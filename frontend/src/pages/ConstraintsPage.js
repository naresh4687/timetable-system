import React, { useState, useEffect } from 'react';
import { constraintAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { LuPlus, LuPen, LuTrash2, LuSave, LuX, LuShieldBan } from 'react-icons/lu';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export default function ConstraintsPage() {
  const [constraints, setConstraints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    staffId: '',
    academicYear: '2025-2026',
    semester: 1,
    avoidDays: [],
    avoidPeriods: [],
    avoidSlots: [],
    maxHours: 17
  });

  const [slotInput, setSlotInput] = useState({ day: 'Monday', period: 1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [constRes, staffRes] = await Promise.all([
        constraintAPI.getAll(),
        userAPI.getStaff()
      ]);
      setConstraints(constRes.data.constraints);
      setStaffList(staffRes.data.staff);
    } catch (error) {
      toast.error('Failed to load constraints data.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      academicYear: '2025-2026',
      semester: 1,
      avoidDays: [],
      avoidPeriods: [],
      avoidSlots: [],
      maxHours: 17
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (c) => {
    setFormData({
      staffId: c.staffId?._id || '',
      academicYear: c.academicYear,
      semester: c.semester,
      avoidDays: c.avoidDays || [],
      avoidPeriods: c.avoidPeriods || [],
      avoidSlots: c.avoidSlots || [],
      maxHours: c.maxHours || 17
    });
    setEditingId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this constraint?')) return;
    try {
      await constraintAPI.delete(id);
      toast.success('Constraint deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete constraint');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId) {
      return toast.error('Please select a staff member');
    }
    
    try {
      if (editingId) {
        await constraintAPI.update(editingId, formData);
        toast.success('Constraint updated successfully');
      } else {
        await constraintAPI.create(formData);
        toast.success('Constraint created successfully');
      }
      fetchData();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save constraint');
    }
  };

  const toggleArrayItem = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const addAvoidSlot = () => {
    const exists = formData.avoidSlots.some(
      s => s.day === slotInput.day && parseInt(s.period) === parseInt(slotInput.period)
    );
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        avoidSlots: [...prev.avoidSlots, { day: slotInput.day, period: parseInt(slotInput.period) }]
      }));
    }
  };

  const removeAvoidSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      avoidSlots: prev.avoidSlots.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Constraint Management</h1>
          <p className="page-subtitle">Define staff constraints for timetable generation</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <LuPlus size={16} /> Add Constraint
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-2 form-card animation-fade-in">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Staff Member *</label>
              <select 
                value={formData.staffId} 
                onChange={e => setFormData({...formData, staffId: e.target.value})}
                disabled={!!editingId}
                required
              >
                <option value="">Select Staff</option>
                {staffList.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.department})</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Academic Year *</label>
              <input 
                type="text" 
                value={formData.academicYear}
                onChange={e => setFormData({...formData, academicYear: e.target.value})}
                required
                placeholder="e.g. 2025-2026"
              />
            </div>

            <div className="form-group">
              <label>Semester *</label>
              <input 
                type="number" 
                min="1" max="8"
                value={formData.semester}
                onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Max Hours Per Week</label>
              <input 
                type="number" 
                min="1" max="40"
                value={formData.maxHours}
                onChange={e => setFormData({...formData, maxHours: parseInt(e.target.value)})}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Avoid Entire Days</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`btn btn-sm ${formData.avoidDays.includes(day) ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleArrayItem('avoidDays', day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Avoid Specific Periods (Every Day)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PERIODS.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`btn btn-sm ${formData.avoidPeriods.includes(p) ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleArrayItem('avoidPeriods', p)}
                  >
                    Period {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Avoid Specific Slots (Day + Period)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <select 
                  value={slotInput.day} 
                  onChange={e => setSlotInput({...slotInput, day: e.target.value})}
                  style={{ width: '150px', marginBottom: 0 }}
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={slotInput.period} 
                  onChange={e => setSlotInput({...slotInput, period: parseInt(e.target.value)})}
                  style={{ width: '120px', marginBottom: 0 }}
                >
                  {PERIODS.map(p => <option key={p} value={p}>Period {p}</option>)}
                </select>
                <button type="button" className="btn btn-secondary" onClick={addAvoidSlot}>Add Slot</button>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {formData.avoidSlots.map((slot, idx) => (
                  <span key={idx} className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {slot.day} P{slot.period}
                    <LuX size={12} style={{ cursor: 'pointer' }} onClick={() => removeAvoidSlot(idx)} />
                  </span>
                ))}
                {formData.avoidSlots.length === 0 && <span className="text-muted text-sm">No specific slots defined.</span>}
              </div>
            </div>

            <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <LuSave size={16} /> {editingId ? 'Update Constraint' : 'Save Constraint'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Academic Info</th>
              <th>Max Hours</th>
              <th>Avoid Directives</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {constraints.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>No constraints defined yet.</td></tr>
            ) : (
              constraints.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.staffId?.name || 'Unknown Staff'}</strong>
                    <div className="text-sm text-muted">{c.staffId?.department || 'N/A'}</div>
                  </td>
                  <td>
                    Sem {c.semester} <br/>
                    <span className="text-sm text-muted">{c.academicYear}</span>
                  </td>
                  <td>{c.maxHours} hr/wk</td>
                  <td>
                    <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {c.avoidDays?.length > 0 && <span><strong>Days:</strong> {c.avoidDays.join(', ')}</span>}
                      {c.avoidPeriods?.length > 0 && <span><strong>Periods:</strong> {c.avoidPeriods.join(', ')}</span>}
                      {c.avoidSlots?.length > 0 && <span><strong>Slots:</strong> {c.avoidSlots.length} defined</span>}
                      {!c.avoidDays?.length && !c.avoidPeriods?.length && !c.avoidSlots?.length && <span className="text-muted">None</span>}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons justify-end">
                      <button className="btn-icon text-primary" onClick={() => handleEdit(c)} title="Edit"><LuPen size={16}/></button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(c._id)} title="Delete"><LuTrash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
