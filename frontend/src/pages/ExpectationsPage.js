import { useState, useEffect } from 'react';
import { expectationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { semToYear } from '../utils/semesterUtils';

export default function ExpectationsPage() {
  const [expectations, setExpectations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpectations = async () => {
    setLoading(true);
    try {
      const { data } = await expectationAPI.getAll();
      setExpectations(data.expectations);
    } catch {
      toast.error('Failed to load expectations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpectations(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expectation?')) return;
    try {
      await expectationAPI.delete(id);
      toast.success('Deleted');
      fetchExpectations();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subject Expectations</h1>
          <p className="page-subtitle">Staff subject preferences for this semester</p>
        </div>
        <span className="badge badge-admin">{expectations.length} Submissions</span>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : expectations.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📋</span>
          <p>No subject expectations submitted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {expectations.map((exp) => (
            <div key={exp._id} className="card">
              <div className="flex-between mb-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="user-avatar" style={{ width: 38, height: 38, flexShrink: 0 }}>
                    {exp.staffName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exp.staffName}</div>
                    <div className="text-muted text-sm">
                      {exp.staffId?.email} · {exp.department}
                    </div>
                  </div>
                </div>
                <div className="flex-gap">
                  <span className="text-muted text-sm">
                    {exp.academicYear} · Updated {new Date(exp.updatedAt).toLocaleDateString()}
                  </span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exp._id)}>
                    🗑️
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                <div>
                  <p className="text-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem', marginBottom: '0.5rem' }}>
                    Theory Subjects ({exp.preferredTheorySubjects?.length}/3)
                  </p>
                  <div className="flex-gap">
                    {exp.preferredTheorySubjects?.length > 0
                      ? exp.preferredTheorySubjects.map((s, idx) => (
                          <span key={`${s.subject}-${idx}`} className="badge badge-theory">
                            {s.subject} (Yr {semToYear(s.semester)} Sem {s.semester} – Sec {s.section})
                          </span>
                        ))
                      : <span className="text-muted text-sm">None</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem', marginBottom: '0.5rem' }}>
                    Lab Subject
                  </p>
                  {exp.preferredLabSubject ? (
                    <span className="badge badge-lab">{exp.preferredLabSubject}</span>
                  ) : (
                    <span className="text-muted text-sm">None</span>
                  )}
                </div>
              </div>

              {exp.additionalNotes && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 0.875rem',
                  background: 'var(--bg)',
                  borderRadius: 7,
                  fontSize: '0.82rem',
                  color: 'var(--text-dim)',
                  borderLeft: '2px solid var(--border-light)',
                }}>
                  📝 {exp.additionalNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
