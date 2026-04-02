import { useState, useEffect } from 'react';
import { expectationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { semToYear } from '../utils/semesterUtils';
import { LuClipboardList, LuTrash2 } from 'react-icons/lu';

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
        <span className="badge badge-admin" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}>{expectations.length} Submissions</span>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : expectations.length === 0 ? (
        <div className="empty-state">
          <span className="icon"><LuClipboardList size={40} /></span>
          <p>No subject expectations submitted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {expectations.map((exp) => (
            <div key={exp._id} className="card">
              <div className="flex-between mb-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="user-avatar" style={{ width: 40, height: 40 }}>
                    {exp.staffName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{exp.staffName}</div>
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
                    <LuTrash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                <div>
                  <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Theory Subjects ({exp.preferredTheorySubjects?.length}/3)
                  </p>
                  <div className="flex-gap">
                    {exp.preferredTheorySubjects?.length > 0
                      ? exp.preferredTheorySubjects.map((s, idx) => (
                          <span key={`${s.subject}-${idx}`} className="badge badge-theory" style={{ padding: '0.25rem 0.6rem' }}>
                            {s.subject} (Yr {semToYear(s.semester)} Sem {s.semester} – Sec {s.section})
                          </span>
                        ))
                      : <span className="text-muted text-sm">None</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Lab Subject
                  </p>
                  {exp.preferredLabSubject ? (
                    <span className="badge badge-lab" style={{ padding: '0.25rem 0.6rem' }}>{exp.preferredLabSubject}</span>
                  ) : (
                    <span className="text-muted text-sm">None</span>
                  )}
                </div>
              </div>

              {exp.additionalNotes && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem 0.875rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  borderLeft: '3px solid var(--primary)',
                }}>
                  {exp.additionalNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
