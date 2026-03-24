import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timetableAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { semLabel, semToYear } from '../utils/semesterUtils';

export default function TimetablesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: '', semester: '' });

  const canEdit = user.role === 'admin';
  const canDelete = user.role === 'admin';

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.semester) params.semester = filters.semester;
      const { data } = await timetableAPI.getAll(params);
      setTimetables(data.timetables);
    } catch (err) {
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimetables(); }, [filters]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete timetable "${title}"?`)) return;
    try {
      await timetableAPI.delete(id);
      toast.success('Timetable deleted');
      fetchTimetables();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleDownload = async (id, dept, sem) => {
    try {
      toast.loading('Generating PDF...');
      await timetableAPI.downloadPDF(id, `timetable-${dept}-sem${sem}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.dismiss();
      toast.error('PDF generation failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Timetables</h1>
          <p className="page-subtitle">View and manage class schedules</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate('/timetables/new')}>
            ➕ New Timetable
          </button>
        )}
      </div>

      <div className="filter-bar">
        <input
          placeholder="Filter by department..."
          value={filters.department}
          onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
        />
        <select value={filters.semester} onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}>
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map((s) => (
            <option key={s} value={s}>{semLabel(s)}</option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ department: '', semester: '' })}>
          Clear
        </button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : timetables.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📅</span>
          <p>No timetables found. {canEdit && 'Create one to get started.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {timetables.map((tt) => (
            <div key={tt._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{tt.title}</div>
                <div className="flex-gap text-sm text-muted">
                  <span>🏛️ {tt.department}</span>
                  <span>·</span>
                  <span>🎓 Year {semToYear(tt.semester)}</span>
                  <span>·</span>
                  <span>📚 Semester {tt.semester}</span>
                  <span>·</span>
                  <span>🔤 Section {tt.section}</span>
                  <span>·</span>
                  <span>📆 {tt.academicYear}</span>
                </div>
                <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                  Created by {tt.createdBy?.name} · {new Date(tt.createdAt).toLocaleDateString()}
                  <span className={`badge badge-${tt.status || 'draft'}`} style={{ marginLeft: '1rem' }}>
                    {(tt.status || 'draft').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-gap">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/timetables/${tt._id}`)}>
                  👁️ View
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleDownload(tt._id, tt.department, tt.semester)}
                >
                  📥 PDF
                </button>
                {canEdit && (
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/timetables/${tt._id}/edit`)}>
                    ✏️ Edit
                  </button>
                )}
                {canDelete && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tt._id, tt.title)}>
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
