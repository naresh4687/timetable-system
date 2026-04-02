import { useState, useEffect } from 'react';
import { expectationAPI, curriculumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { semLabel, semToYear } from '../utils/semesterUtils';
import { LuCheck, LuRefreshCw } from 'react-icons/lu';

export default function PreferencesPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    preferredTheorySubjects: [],
    preferredLabSubject: '',
    additionalNotes: '',
    academicYear: '2025-2026',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);
  const [curricula, setCurricula] = useState([]);
  const [takenExpectations, setTakenExpectations] = useState([]);
  const [semType, setSemType] = useState('odd');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, curRes, takenRes] = await Promise.all([
        expectationAPI.getMyExpectation(),
        curriculumAPI.getAll(),
        expectationAPI.getTaken(form.academicYear),
      ]);
      if (expRes.data.expectation) {
        const exp = expRes.data.expectation;
        setExisting(exp);
        setForm((f) => ({
          ...f,
          preferredTheorySubjects: exp.preferredTheorySubjects || [],
          preferredLabSubject: exp.preferredLabSubject || '',
          additionalNotes: exp.additionalNotes || '',
          academicYear: exp.academicYear || '2025-2026',
        }));
      }
      setCurricula(curRes.data.curricula || []);
      setTakenExpectations(takenRes.data.taken || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [form.academicYear]);

  const getActiveSemesters = () => {
    const assigned = user?.handledSemesters;
    if (assigned && assigned.length > 0) return assigned;
    return semType === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];
  };

  const getAvailableTheory = () => {
    const sems = getActiveSemesters();
    const available = [];
    curricula.forEach((curriculum) => {
      if (sems.includes(curriculum.semester)) {
        curriculum.subjects.forEach((subj) => {
          if (subj.type === 'theory') {
            for (let i = 0; i < curriculum.sections; i++) {
              const section = String.fromCharCode(65 + i);
              available.push({ subject: subj.name, code: subj.code, semester: curriculum.semester, section });
            }
          }
        });
      }
    });
    return available;
  };

  const getAvailableLabs = () => {
    const sems = getActiveSemesters();
    const labs = [];
    curricula.forEach((curriculum) => {
      if (sems.includes(curriculum.semester)) {
        curriculum.subjects.forEach((subj) => {
          if (subj.type === 'lab') {
            labs.push({ name: `${subj.name} (Sem ${curriculum.semester})`, code: subj.code, semester: curriculum.semester });
          }
        });
      }
    });
    return labs;
  };

  const isTaken = (subjectObj) => {
    return takenExpectations.some(
      (t) => t.subject === subjectObj.subject && t.semester === subjectObj.semester && t.section === subjectObj.section
    );
  };

  const toggleTheory = (subjectObj) => {
    setForm((f) => {
      const exists = f.preferredTheorySubjects.some(
        (s) => s.subject === subjectObj.subject && s.semester === subjectObj.semester && s.section === subjectObj.section
      );
      if (!exists && f.preferredTheorySubjects.length >= 3) { toast.error('Maximum 3 theory subjects allowed'); return f; }
      return {
        ...f,
        preferredTheorySubjects: exists
          ? f.preferredTheorySubjects.filter(
              (s) => !(s.subject === subjectObj.subject && s.semester === subjectObj.semester && s.section === subjectObj.section)
            )
          : [...f.preferredTheorySubjects, subjectObj],
      };
    });
  };

  const handleSubmit = async () => {
    if (form.preferredTheorySubjects.length === 0) { toast.error('Please select at least one theory subject'); return; }
    setSaving(true);
    try {
      await expectationAPI.submit(form);
      toast.success('Preferences saved successfully!');
      setExisting(form);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const theorySubjects = getAvailableTheory();
  const labSubjects = getAvailableLabs();
  const hasAssignedSemesters = user?.handledSemesters?.length > 0;

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subject Preferences</h1>
          <p className="page-subtitle">Select subjects you'd like to teach this semester</p>
        </div>
        {existing && (
          <span className="badge badge-staff" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <LuCheck size={14} style={{ marginRight: '0.25rem' }} /> Preferences Submitted
          </span>
        )}
      </div>

      {existing && (
        <div className="alert alert-success mb-2">
          Your preferences were last updated on {new Date(existing.updatedAt || Date.now()).toLocaleDateString()}. You can update them below.
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr 320px' }}>
        <div>
          {/* Filters Row */}
          <div className="card mb-2">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 180 }}>
                <label>Academic Year</label>
                <input value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))} placeholder="2025-2026" />
              </div>

              {!hasAssignedSemesters && (
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 180 }}>
                  <label>Semester Type</label>
                  <select value={semType} onChange={(e) => setSemType(e.target.value)}>
                    <option value="odd">Odd – Sem 1, 3, 5, 7</option>
                    <option value="even">Even – Sem 2, 4, 6, 8</option>
                  </select>
                </div>
              )}

              {hasAssignedSemesters && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Your Assigned Semesters</label>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: 4 }}>
                    {user.handledSemesters.sort((a, b) => a - b).map((sem) => (
                      <span key={sem} className="badge badge-theory" style={{ padding: '0.3rem 0.65rem' }}>
                        Yr {semToYear(sem)} · Sem {sem}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theory Subjects */}
          <div className="card mb-2">
            <div className="flex-between mb-2">
              <div>
                <h3 className="card-title">Theory Subjects</h3>
                <p className="card-subtitle">Select up to 3 theory subjects</p>
              </div>
              <span style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: 20,
                background: form.preferredTheorySubjects.length >= 3 ? 'var(--warning-light)' : 'var(--primary-light)',
                color: form.preferredTheorySubjects.length >= 3 ? 'var(--warning)' : 'var(--primary)',
              }}>
                {form.preferredTheorySubjects.length} / 3 selected
              </span>
            </div>
            {theorySubjects.length === 0 ? (
              <p className="text-muted text-sm">
                {hasAssignedSemesters ? 'No theory subjects found for your assigned semesters.' : 'No curriculum defined for the selected semesters.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {theorySubjects.map((s, idx) => {
                  const selected = form.preferredTheorySubjects.some(
                    (pref) => pref.subject === s.subject && pref.semester === s.semester && pref.section === s.section
                  );
                  const taken = isTaken(s);
                  const disabled = taken && !selected;
                  const label = `${s.subject} (Yr ${semToYear(s.semester)} Sem ${s.semester} – Sec ${s.section})`;
                  return (
                    <button key={`${s.subject}-${s.semester}-${s.section}-${idx}`}
                      onClick={() => { if (!disabled) toggleTheory(s); }} disabled={disabled}
                      title={disabled ? 'Already selected by another staff' : ''}
                      style={{
                        padding: '0.45rem 0.875rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        border: selected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                        background: disabled ? '#f1f5f9' : selected ? 'var(--primary-light)' : 'var(--bg-white)',
                        color: disabled ? 'var(--text-muted)' : selected ? 'var(--primary)' : 'var(--text-secondary)',
                        opacity: disabled ? 0.6 : 1, transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                      }}>
                      {selected ? '✓ ' : ''}{label} {disabled ? '🔒' : ''}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lab Subjects */}
          <div className="card mb-2">
            <h3 className="card-title mb-2">Lab Subject <span className="text-muted text-sm" style={{ fontWeight: 400 }}>(Optional — select one)</span></h3>
            {labSubjects.length === 0 ? (
              <p className="text-muted text-sm">No lab subjects found for the selected semesters.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {labSubjects.map((lab) => {
                  const selected = form.preferredLabSubject === lab.name;
                  return (
                    <button key={`${lab.code}-${lab.semester}`}
                      onClick={() => setForm((f) => ({ ...f, preferredLabSubject: selected ? '' : lab.name }))}
                      style={{
                        padding: '0.45rem 0.875rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        border: selected ? '1.5px solid #7c3aed' : '1.5px solid var(--border)',
                        background: selected ? '#f5f3ff' : 'var(--bg-white)',
                        color: selected ? '#7c3aed' : 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}>
                      {selected ? '✓ ' : ''}{lab.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea rows={3} placeholder="Any special requirements or availability constraints..."
              value={form.additionalNotes} onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))} />
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 1rem)' }}>
            <h3 className="card-title mb-2">Your Selection</h3>

            <div className="mb-2">
              <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Theory Subjects ({form.preferredTheorySubjects.length}/3)
              </p>
              {form.preferredTheorySubjects.length === 0 ? (
                <p className="text-muted text-sm">None selected</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {form.preferredTheorySubjects.map((s, i) => (
                    <div key={`${s.subject}-${s.semester}-${s.section}`} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem',
                      padding: '0.3rem 0.5rem', background: 'var(--primary-light)', borderRadius: 6, color: 'var(--primary)',
                    }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', opacity: 0.7 }}>#{i + 1}</span>
                      {s.subject} <span className="text-muted" style={{ fontSize: '0.75rem' }}>(Yr {semToYear(s.semester)} Sem {s.semester} – {s.section})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-2">
              <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '0.4rem', fontWeight: 600 }}>Lab Subject</p>
              <p style={{ fontSize: '0.82rem' }}>
                {form.preferredLabSubject || <span className="text-muted">None selected</span>}
              </p>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : existing ? <><LuRefreshCw size={16} /> Update Preferences</> : <><LuCheck size={16} /> Submit Preferences</>}
            </button>

            <p className="text-muted text-sm text-center mt-1">You can update your preferences anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
