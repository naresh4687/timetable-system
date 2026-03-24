import { useState, useEffect, useCallback } from 'react';
import { subjectAPI, expectationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Small SVG spinner ───────────────────────────────────────────────────── */
function Spinner({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

/* ─── Styled Select wrapper ───────────────────────────────────────────────── */
function StyledSelect({ label, value, onChange, disabled, children, loading }) {
  return (
    <div className="form-group" style={{ margin: 0, flex: '1 1 200px', minWidth: 180 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
        {loading && <Spinner size={14} />}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: disabled ? 'var(--bg-secondary)' : 'var(--bg)',
          color: value ? 'var(--text)' : 'var(--text-muted)',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      >
        {children}
      </select>
    </div>
  );
}

/* ─── Subject Chip (checkbox-style button) ───────────────────────────────── */
function SubjectChip({ subject, selected, disabled, onToggle, accentColor = 'var(--accent)' }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(subject)}
      disabled={disabled}
      title={disabled && !selected ? `Already taken by another staff` : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0.5rem 0.9rem',
        borderRadius: 10,
        border: selected ? `1.5px solid ${accentColor}` : '1.5px solid var(--border-light)',
        background: selected ? `${accentColor}18` : 'var(--bg)',
        color: disabled && !selected ? 'var(--text-muted)' : selected ? accentColor : 'var(--text-dim)',
        opacity: disabled && !selected ? 0.55 : 1,
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
        fontSize: '0.82rem',
        fontWeight: selected ? 600 : 400,
        transition: 'all 0.15s ease',
        textAlign: 'left',
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        border: selected ? `2px solid ${accentColor}` : '2px solid var(--border)',
        background: selected ? accentColor : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span>
        <strong>{subject.name}</strong>
        <span style={{ fontSize: '0.72rem', marginLeft: 6, opacity: 0.7 }}>
          ({subject.code}){subject.section ? ` - Sec ${subject.section}` : ''}
        </span>
        {disabled && !selected && <span style={{ marginLeft: 4 }}>🔒</span>}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function SubjectSelectionPage() {
  const { user } = useAuth();

  /* ── Dropdown selections ── */
  const [academicYear, setAcademicYear]     = useState('');
  const [semesterType, setSemesterType]     = useState('');
  const [semester,     setSemester]         = useState('');

  /* ── Data lists ── */
  const [academicYears, setAcademicYears]   = useState([]);
  const [semesterList,  setSemesterList]    = useState([]);
  const [theorySubjects, setTheorySubjects] = useState([]);
  const [labSubjects,    setLabSubjects]    = useState([]);

  /* ── Staff selections ── */
  const [selectedTheory, setSelectedTheory] = useState([]);
  const [selectedLab,    setSelectedLab]    = useState(null);

  /* ── Taken by others ── */
  const [takenKeys, setTakenKeys] = useState(new Set());

  /* ── Loading flags ── */
  const [loadingYears,    setLoadingYears]    = useState(true);
  const [loadingSems,     setLoadingSems]     = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving,          setSaving]          = useState(false);

  /* ── Existing preference (for update mode) ── */
  const [existing, setExisting] = useState(null);

  /* ── Step visibility ── */
  const showSemType  = !!academicYear;
  const showSemester = showSemType && !!semesterType;
  const showSubjects = showSemester && !!semester && !loadingSubjects;

  /* ─── 1. Fetch academic years on mount ───────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await subjectAPI.getAcademicYears();
        setAcademicYears(res.data.academicYears || []);
      } catch {
        toast.error('Failed to load academic years');
      } finally {
        setLoadingYears(false);
      }
    })();
  }, []);

  /* ─── 2. Load existing preference (pre-fill) ─────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await expectationAPI.getMyExpectation();
        if (res.data.expectation) {
          const exp = res.data.expectation;
          setExisting(exp);
          if (exp.academicYear) setAcademicYear(exp.academicYear);
          if (exp.semesterType) setSemesterType(exp.semesterType);
          if (exp.semester)     setSemester(String(exp.semester));
          setSelectedTheory(exp.preferredTheorySubjects || []);
          setSelectedLab(exp.preferredLabSubject || null);
        }
      } catch { /* silent */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── 3. Load semesters when semesterType changes ───────────────────── */
  useEffect(() => {
    if (!semesterType || !academicYear) { setSemesterList([]); return; }
    setLoadingSems(true);
    subjectAPI.getSemesters(academicYear, semesterType)
      .then(res => setSemesterList(res.data.semesters || []))
      .catch(() => toast.error('Failed to load semesters'))
      .finally(() => setLoadingSems(false));
  }, [semesterType, academicYear]);

  /* ─── 4. Load subjects when semester (+ year + type) is selected ─────── */
  const fetchSubjects = useCallback(async () => {
    if (!semester || !semesterType || !academicYear) return;
    setLoadingSubjects(true);
    setTheorySubjects([]);
    setLabSubjects([]);
    try {
      const [subjectsRes, takenRes] = await Promise.all([
        subjectAPI.getSubjects(academicYear, semesterType, semester),
        expectationAPI.getTaken(academicYear),
      ]);
      
      console.log("Subjects Response:", subjectsRes.data);
      
      setTheorySubjects(subjectsRes.data.theorySubjects || []);
      setLabSubjects(subjectsRes.data.labSubjects || []);

      // Build a Set of taken subject codes (by other staff)
      const takenSet = new Set();
      (takenRes.data.taken || []).forEach(t => takenSet.add(t.subject));
      setTakenKeys(takenSet);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  }, [semester, semesterType, academicYear]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  /* ─── Handlers ───────────────────────────────────────────────────────── */
  const handleYearChange = (e) => {
    setAcademicYear(e.target.value);
    setSemesterType('');
    setSemester('');
    setSelectedTheory([]);
    setSelectedLab(null);
    setTheorySubjects([]);
    setLabSubjects([]);
  };

  const handleTypeChange = (e) => {
    setSemesterType(e.target.value);
    setSemester('');
    setSelectedTheory([]);
    setSelectedLab(null);
    setTheorySubjects([]);
    setLabSubjects([]);
  };

  const handleSemesterChange = (e) => {
    setSemester(e.target.value);
    setSelectedTheory([]);
    setSelectedLab(null);
  };

  const toggleTheory = (subject) => {
    setSelectedTheory(prev => {
      const already = prev.find(s => 
        (s.subject === subject.name || s.subject === subject.code) && 
        s.section === subject.section
      );
      if (already) {
        return prev.filter(s => 
          !( (s.subject === subject.name || s.subject === subject.code) && s.section === subject.section )
        );
      }
      if (prev.length >= 3) {
        toast.error('Maximum 3 theory subjects allowed');
        return prev;
      }
      return [...prev, {
        subject: subject.name,
        code: subject.code,
        semester: Number(semester),
        section: subject.section || 'A',
      }];
    });
  };

  const toggleLab = (subject) => {
    setSelectedLab(prev =>
      prev && prev.code === subject.code ? null : { name: subject.name, code: subject.code }
    );
  };

  const handleSubmit = async () => {
    if (!academicYear || !semesterType || !semester) {
      toast.error('Please complete all dropdown selections');
      return;
    }
    if (selectedTheory.length === 0) {
      toast.error('Please select at least one theory subject');
      return;
    }
    setSaving(true);
    try {
      await expectationAPI.submit({
        academicYear,
        semesterType,
        semester: Number(semester),
        preferredTheorySubjects: selectedTheory,
        preferredLabSubject: selectedLab ? selectedLab.name : null,
      });
      toast.success(existing ? 'Preferences updated!' : 'Preferences saved!');
      setExisting({ academicYear, semesterType, semester: Number(semester) });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Subject Selection</h1>
          <p className="page-subtitle">
            Choose subjects you'd like to teach — up to 3 theory and 1 lab
          </p>
        </div>
        {existing && (
          <span
            className="badge badge-staff"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', alignSelf: 'flex-start' }}
          >
            ✓ Preferences Submitted
          </span>
        )}
      </div>

      {existing && (
        <div className="alert alert-success mb-2">
          Your preferences are saved. Change any selection below and click <strong>Update</strong> to revise.
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'minmax(0,1fr) 300px',
          alignItems: 'start',
        }}
      >
        {/* ── Left column ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Step 1 → Academic Year */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--accent)', color: '#fff',
                  fontSize: '0.72rem', fontWeight: 700, marginRight: 8,
                }}
              >1</span>
              Step 1 — Academic Year
            </h3>

            {loadingYears ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Spinner size={16} /> Loading academic years…
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1rem' }}>
                <StyledSelect
                  label="Academic Year"
                  value={academicYear}
                  onChange={handleYearChange}
                >
                  <option value="">— Select Academic Year —</option>
                  {academicYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </StyledSelect>
              </div>
            )}
          </div>

          {/* Step 2 → Semester Type */}
          {showSemType && (
            <div className="card" style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    fontSize: '0.72rem', fontWeight: 700, marginRight: 8,
                  }}
                >2</span>
                Step 2 — Semester Type
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['odd', 'even'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange({ target: { value: type } })}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: 10,
                      border: semesterType === type ? '2px solid var(--accent)' : '2px solid var(--border-light)',
                      background: semesterType === type ? 'var(--accent-glow)' : 'var(--bg)',
                      color: semesterType === type ? 'var(--accent)' : 'var(--text-dim)',
                      fontWeight: semesterType === type ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontSize: '0.9rem',
                    }}
                  >
                    {type === 'odd' ? '🌙 Odd Semester' : '☀️ Even Semester'}
                    <div style={{ fontSize: '0.72rem', marginTop: 2, opacity: 0.7 }}>
                      {type === 'odd' ? 'Sem 1, 3, 5, 7' : 'Sem 2, 4, 6, 8'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 → Semester */}
          {showSemester && (
            <div className="card" style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    fontSize: '0.72rem', fontWeight: 700, marginRight: 8,
                  }}
                >3</span>
                Step 3 — Semester
                {loadingSems && <Spinner size={14} style={{ marginLeft: 8 }} />}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {semesterList.map(sem => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => handleSemesterChange({ target: { value: String(sem) } })}
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: 8,
                      border: semester === String(sem) ? '2px solid var(--accent)' : '2px solid var(--border-light)',
                      background: semester === String(sem) ? 'var(--accent-glow)' : 'var(--bg)',
                      color: semester === String(sem) ? 'var(--accent)' : 'var(--text-dim)',
                      fontWeight: semester === String(sem) ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontSize: '0.88rem',
                    }}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4a → Theory Subjects */}
          {showSemester && semester && (
            <div className="card" style={{ animation: 'fadeIn 0.2s ease' }}>
              <div className="flex-between mb-2">
                <div>
                  <h3 className="card-title">
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'var(--accent)', color: '#fff',
                        fontSize: '0.72rem', fontWeight: 700, marginRight: 8,
                      }}
                    >4</span>
                    Theory Subjects
                  </h3>
                  <p className="card-subtitle" style={{ marginLeft: 32 }}>
                    Select up to <strong>3</strong> theory subjects
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.65rem',
                    borderRadius: 20,
                    background: selectedTheory.length >= 3 ? 'rgba(239,68,68,0.12)' : 'var(--accent-glow)',
                    color: selectedTheory.length >= 3 ? '#ef4444' : 'var(--accent)',
                  }}
                >
                  {selectedTheory.length} / 3
                </span>
              </div>

              {loadingSubjects ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                  <Spinner size={18} /> Loading subjects…
                </div>
              ) : theorySubjects.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center', padding: '2rem 1rem',
                    color: 'var(--text-muted)', fontSize: '0.88rem',
                    border: '1.5px dashed var(--border)', borderRadius: 10,
                  }}
                >
                  📭 No theory subjects available for Semester {semester}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {theorySubjects.map(subj => {
                    const isSelected = selectedTheory.some(s =>
                      (s.subject === subj.name || s.subject === subj.code) && s.section === subj.section
                    );
                    const isTaken = takenKeys.has(subj.name) && !isSelected;
                    return (
                      <SubjectChip
                        key={subj.code}
                        subject={subj}
                        selected={isSelected}
                        disabled={isTaken || (!isSelected && selectedTheory.length >= 3)}
                        onToggle={toggleTheory}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4b → Lab Subject */}
          {showSemester && semester && !loadingSubjects && (
            <div className="card" style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 className="card-title mb-2">
                Lab Subject{' '}
                <span className="text-muted text-sm" style={{ fontWeight: 400 }}>
                  (Optional — select 1)
                </span>
              </h3>
              {labSubjects.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center', padding: '1.5rem 1rem',
                    color: 'var(--text-muted)', fontSize: '0.88rem',
                    border: '1.5px dashed var(--border)', borderRadius: 10,
                  }}
                >
                  📭 No lab subjects for Semester {semester}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {labSubjects.map(subj => (
                    <SubjectChip
                      key={subj.code}
                      subject={subj}
                      selected={selectedLab?.code === subj.code}
                      disabled={false}
                      onToggle={toggleLab}
                      accentColor="#8b5cf6"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar — summary ─────────────────────────── */}
        <div className="card" style={{ position: 'sticky', top: '1rem' }}>
          <h3 className="card-title mb-2">📋 Your Selection</h3>

          {/* Filter summary */}
          <div
            style={{
              background: 'var(--bg-secondary)', borderRadius: 8,
              padding: '0.65rem 0.85rem', marginBottom: '1rem',
              fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <div><span style={{ color: 'var(--text-muted)' }}>Year:</span> <strong>{academicYear || '–'}</strong></div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Type:</span>{' '}
              <strong style={{ textTransform: 'capitalize' }}>{semesterType || '–'}</strong>
            </div>
            <div><span style={{ color: 'var(--text-muted)' }}>Semester:</span> <strong>{semester ? `Semester ${semester}` : '–'}</strong></div>
          </div>

          {/* Theory list */}
          <p
            style={{
              fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'var(--text-muted)', marginBottom: '0.4rem',
            }}
          >
            Theory ({selectedTheory.length}/3)
          </p>
          {selectedTheory.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              None selected
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
              {selectedTheory.map((s, i) => (
                <div
                  key={`${s.subject}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '0.82rem', padding: '0.3rem 0.5rem',
                    background: 'var(--accent-glow)', borderRadius: 6,
                    color: 'var(--accent)',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', opacity: 0.7 }}>#{i + 1}</span>
                  <span style={{ flex: 1 }}>{s.subject} {s.section ? `(Sec ${s.section})` : ''}</span>
                  <button
                    onClick={() => setSelectedTheory(p => p.filter((_, j) => j !== i))}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--accent)', fontSize: '0.9rem', padding: 0, lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Lab */}
          <p
            style={{
              fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'var(--text-muted)', marginBottom: '0.4rem',
            }}
          >
            Lab (optional)
          </p>
          {selectedLab ? (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.82rem', padding: '0.3rem 0.5rem',
                background: 'rgba(139,92,246,0.1)', borderRadius: 6,
                color: '#8b5cf6', marginBottom: '1rem',
              }}
            >
              <span style={{ flex: 1 }}>{selectedLab.name}</span>
              <button
                onClick={() => setSelectedLab(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8b5cf6', fontSize: '0.9rem', padding: 0, lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              None selected
            </p>
          )}

          {/* Submit */}
          <button
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={saving || !showSubjects || selectedTheory.length === 0}
            style={{ marginTop: '0.25rem' }}
          >
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Spinner size={16} /> Saving…
              </span>
            ) : existing ? '🔄 Update Preferences' : '✅ Submit Preferences'}
          </button>

          {selectedTheory.length === 0 && showSubjects && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', textAlign: 'center', marginTop: '0.4rem' }}>
              ⚠ Select at least 1 theory subject
            </p>
          )}

          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            You can update preferences anytime
          </p>
        </div>
      </div>

      {/* Keyframe for fade-in */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
