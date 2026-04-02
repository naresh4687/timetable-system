import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { timetableAPI, userAPI, curriculumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuSave, LuRocket, LuCheck, LuX, LuBuilding, LuBookOpen, LuCalendarDays } from 'react-icons/lu';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const defaultPeriods = [
  { period: 1, startTime: '09:15', endTime: '10:05' },
  { period: 2, startTime: '10:05', endTime: '10:55' },
  { period: 3, startTime: '11:10', endTime: '12:00' },
  { period: 4, startTime: '12:00', endTime: '12:50' },
  { period: 5, startTime: '13:45', endTime: '14:35' },
  { period: 6, startTime: '14:35', endTime: '15:25' },
  { period: 7, startTime: '15:40', endTime: '16:30' },
];

const makeSchedule = () =>
  DAYS.map((day) => ({
    day,
    slots: defaultPeriods.map((p) => ({
      ...p, subject: '', staffId: '', staffName: '', classroom: '', type: 'theory',
    })),
  }));

// ─── CREATE MODE ────────────────────────────────────────────────────────────
function CreateTimetableForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('AD&DS');
  const [semType, setSemType] = useState('odd');
  const [loading, setLoading] = useState(false);
  const [allCurricula, setAllCurricula] = useState([]);
  const [fetchingCurricula, setFetchingCurricula] = useState(true);

  useEffect(() => {
    curriculumAPI.getAll()
      .then(({ data }) => setAllCurricula(data.curricula))
      .catch(() => {})
      .finally(() => setFetchingCurricula(false));
  }, []);

  const semesters = semType === 'even' ? [2, 4, 6, 8] : [1, 3, 5, 7];
  const semHasCurriculum = (sem) => allCurricula.some((c) => c.semester === sem);
  const readySemesters = semesters.filter(semHasCurriculum);

  const handleGenerate = async () => {
    if (!title.trim()) { toast.error('Please enter a title.'); return; }
    if (readySemesters.length === 0) { toast.error('No curricula defined for selected semesters.'); return; }
    setLoading(true);
    try {
      const { data } = await curriculumAPI.generate({ title, type: semType, department });
      const count = data.created?.length || 0;
      let msg = `${count} timetable(s) generated!`;
      if (data.missingSemesters?.length > 0) msg += ` (Missing curriculum for Sem: ${data.missingSemesters.join(', ')})`;
      toast.success(msg, { duration: 5000 });
      setTimeout(() => navigate('/timetables'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCurricula) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/timetables')} style={{ marginBottom: '0.5rem' }}>
            <LuArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">Create Timetables</h1>
          <p className="page-subtitle">Auto-generate timetables for all years & sections from curriculum</p>
        </div>
      </div>

      <div className="card mb-2">
        <h3 className="card-title mb-2">Timetable Details</h3>
        <div className="grid-2">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Title *</label>
            <input placeholder="e.g. AD&DS 2025-2026 Odd Semester" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Semester Type *</label>
            <select value={semType} onChange={(e) => setSemType(e.target.value)}>
              <option value="odd">Odd Semesters (1, 3, 5, 7)</option>
              <option value="even">Even Semesters (2, 4, 6, 8)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <h3 className="card-title mb-2">Timetables to Generate</h3>
        <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
          Based on your curriculum, the following timetables will be auto-created. Labs will be allocated 4 consecutive periods.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {semesters.map((sem) => {
            const curr = allCurricula.find((c) => c.semester === sem);
            const year = Math.ceil(sem / 2);
            return (
              <div key={sem} style={{
                padding: '0.85rem 1rem', borderRadius: 'var(--radius)',
                background: curr ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${curr ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text)' }}>
                  {curr ? <LuCheck size={14} style={{ color: 'var(--success)', marginRight: '0.3rem' }} /> : <LuX size={14} style={{ color: 'var(--danger)', marginRight: '0.3rem' }} />}
                  Year {year} — Semester {sem}
                </div>
                {curr ? (
                  <div className="text-sm text-muted">
                    {curr.subjects.length} subject(s) · {curr.sections} section(s){' '}
                    ({Array.from({ length: curr.sections }, (_, i) => String.fromCharCode(65 + i)).join(', ')})
                    <br />↳ Will create <strong>{curr.sections}</strong> timetable(s)
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: 'var(--danger)' }}>
                    No curriculum defined — <a href="/curriculum" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Set up curriculum →</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="alert alert-info" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          <strong>Total:</strong> {readySemesters.length} semester(s) ready ·{' '}
          {readySemesters.reduce((sum, sem) => { const c = allCurricula.find((cr) => cr.semester === sem); return sum + (c?.sections || 0); }, 0)} timetable(s) will be generated
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/timetables')}>Cancel</button>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || readySemesters.length === 0} style={{ minWidth: 200 }}>
          {loading ? 'Generating...' : <><LuRocket size={16} /> Generate {readySemesters.reduce((sum, sem) => { const c = allCurricula.find((cr) => cr.semester === sem); return sum + (c?.sections || 0); }, 0)} Timetable(s)</>}
        </button>
      </div>
    </div>
  );
}

// ─── EDIT MODE ──────────────────────────────────────────────────────────────
function EditTimetableForm({ id }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meta, setMeta] = useState({ title: '', department: 'AD&DS', semester: '', section: 'A', academicYear: '2025-2026' });
  const [schedule, setSchedule] = useState(makeSchedule());
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingCell, setEditingCell] = useState(null);

  useEffect(() => { userAPI.getStaff().then(({ data }) => setStaff(data.staff)).catch(() => {}); }, []);

  useEffect(() => {
    timetableAPI.getById(id)
      .then(({ data }) => {
        const tt = data.timetable;
        setMeta({ title: tt.title, department: tt.department, semester: tt.semester, section: tt.section, academicYear: tt.academicYear });
        setSchedule(tt.schedule.length > 0 ? tt.schedule : makeSchedule());
      })
      .catch(() => toast.error('Failed to load timetable'))
      .finally(() => setFetching(false));
  }, [id]);

  const updateSlot = (dayIdx, slotIdx, field, value) => {
    setSchedule((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[dayIdx].slots[slotIdx][field] = value;
      if (field === 'staffId') {
        const member = staff.find((s) => s._id === value);
        next[dayIdx].slots[slotIdx].staffName = member ? member.name : '';
      }
      return next;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...meta, semester: Number(meta.semester), schedule };
      await timetableAPI.update(id, payload);
      toast.success('Timetable updated!');
      navigate(`/timetables/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/timetables')} style={{ marginBottom: '0.5rem' }}>
            <LuArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">Edit Timetable</h1>
          <p className="page-subtitle">{meta.title}</p>
        </div>
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : <><LuSave size={16} /> Update</>}
          </button>
        </div>
      </div>

      <div className="card mb-2" style={{ padding: '0.85rem 1.15rem' }}>
        <div className="flex-gap text-sm">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><LuBuilding size={14} /> <strong>{meta.department}</strong></span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><LuBookOpen size={14} /> Semester {meta.semester}</span>
          <span>·</span>
          <span>Section {meta.section}</span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><LuCalendarDays size={14} /> {meta.academicYear}</span>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <h3 className="card-title mb-1">Weekly Schedule</h3>
        <p className="text-muted text-sm mb-2">Click any cell to edit subject, staff, and classroom details.</p>

        <div className="tt-grid">
          <table className="tt-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', minWidth: 110 }}>Day</th>
                {schedule[0]?.slots.map((slot) => (
                  <th key={slot.period}>
                    P{slot.period}<br />
                    <span style={{ fontWeight: 400, fontSize: '0.65rem' }}>{slot.startTime}–{slot.endTime}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((day, dayIdx) => (
                <tr key={day.day}>
                  <td style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.82rem', padding: '0.5rem' }}>
                    {day.day}
                  </td>
                  {day.slots.map((slot, slotIdx) => (
                    <td key={slotIdx} className="tt-cell" style={{ padding: '0.3rem' }}>
                      {editingCell?.dayIdx === dayIdx && editingCell?.slotIdx === slotIdx ? (
                        <div style={{ minWidth: 150 }}>
                          <select value={slot.type} onChange={(e) => updateSlot(dayIdx, slotIdx, 'type', e.target.value)}
                            style={{ marginBottom: '0.3rem', fontSize: '0.72rem', padding: '0.25rem' }}>
                            <option value="theory">Theory</option>
                            <option value="lab">Lab</option>
                            <option value="break">Break</option>
                            <option value="free">Free</option>
                          </select>
                          {slot.type !== 'break' && slot.type !== 'free' && (
                            <>
                              <input placeholder="Subject" value={slot.subject}
                                onChange={(e) => updateSlot(dayIdx, slotIdx, 'subject', e.target.value)}
                                style={{ marginBottom: '0.25rem', fontSize: '0.72rem', padding: '0.25rem' }} />
                              <select value={slot.staffId} onChange={(e) => updateSlot(dayIdx, slotIdx, 'staffId', e.target.value)}
                                style={{ marginBottom: '0.25rem', fontSize: '0.72rem', padding: '0.25rem' }}>
                                <option value="">Select Staff</option>
                                {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                              </select>
                              <input placeholder="Room/Lab" value={slot.classroom}
                                onChange={(e) => updateSlot(dayIdx, slotIdx, 'classroom', e.target.value)}
                                style={{ marginBottom: '0.25rem', fontSize: '0.72rem', padding: '0.25rem' }} />
                            </>
                          )}
                          <button className="btn btn-primary btn-sm"
                            style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.7rem', padding: '0.25rem' }}
                            onClick={() => setEditingCell(null)}>
                            <LuCheck size={12} /> Done
                          </button>
                        </div>
                      ) : (
                        <div onClick={() => setEditingCell({ dayIdx, slotIdx })} style={{ cursor: 'pointer', minHeight: 52 }}>
                          {slot.type === 'break' ? (
                            <div className="tt-break">☕ Break</div>
                          ) : slot.type === 'free' || !slot.subject ? (
                            <div className="tt-free" style={{ fontSize: '0.7rem' }}>+ Add</div>
                          ) : (
                            <div className="tt-slot">
                              <div className="tt-slot-subject">{slot.subject}</div>
                              {slot.staffName && <div className="tt-slot-staff">{slot.staffName}</div>}
                              {slot.classroom && <div className="tt-slot-room">{slot.classroom}</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TimetableEditorPage() {
  const { id } = useParams();
  if (id) return <EditTimetableForm id={id} />;
  return <CreateTimetableForm />;
}
