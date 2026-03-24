import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { timetableAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function TimetableViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    timetableAPI.getById(id)
      .then(({ data }) => setTimetable(data.timetable))
      .catch(() => toast.error('Failed to load timetable'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    try {
      toast.loading('Generating PDF...');
      await timetableAPI.downloadPDF(
        id,
        `timetable-${timetable.department}-sem${timetable.semester}.pdf`
      );
      toast.dismiss();
      toast.success('PDF downloaded!');
    } catch {
      toast.dismiss();
      toast.error('PDF generation failed');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (newStatus === 'rejected') {
        const reason = window.prompt('Enter reason for rejection:');
        if (reason === null) return; 
        await timetableAPI.updateStatus(id, { status: newStatus, rejectionReason: reason });
      } else {
        if (!window.confirm('Are you sure you want to approve this timetable?')) return;
        await timetableAPI.updateStatus(id, { status: newStatus });
      }
      toast.success(`Timetable ${newStatus}!`);
      // Reload timetable
      const { data } = await timetableAPI.getById(id);
      setTimetable(data.timetable);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!timetable) return <div className="empty-state"><span className="icon">❌</span><p>Timetable not found.</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/timetables')}
            style={{ marginBottom: '0.5rem' }}
          >
            ← Back
          </button>
          <h1 className="page-title">{timetable.title}</h1>
          <div className="flex-gap text-sm text-muted" style={{ marginTop: '0.25rem' }}>
            <span>🏛️ {timetable.department}</span>
            <span>·</span>
            <span>📚 Semester {timetable.semester}</span>
            <span>·</span>
            <span>🔤 Section {timetable.section}</span>
            <span>·</span>
            <span>📆 {timetable.academicYear}</span>
            <span className={`badge badge-${timetable.status || 'draft'}`} style={{ marginLeft: '0.5rem' }}>
              {(timetable.status || 'draft').toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-gap">
          <button className="btn btn-success" onClick={handleDownload}>
            📥 Download PDF
          </button>
          
          {user.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => navigate(`/timetables/${id}/edit`)}>
              ✏️ Edit
            </button>
          )}

          {user.role === 'manager' && (timetable.status === 'draft' || !timetable.status) && (
            <>
              <button className="btn btn-success" onClick={() => handleStatusUpdate('approved')}>
                ✅ Approve
              </button>
              <button className="btn btn-danger" onClick={() => handleStatusUpdate('rejected')}>
                ❌ Reject
              </button>
            </>
          )}
        </div>
      </div>

      {timetable.status === 'rejected' && timetable.rejectionReason && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <strong>Rejected:</strong> {timetable.rejectionReason}
        </div>
      )}

      {timetable.schedule.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📅</span>
          <p>No schedule data. Edit this timetable to add slots.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '1rem' }}>
          <div className="tt-grid">
            <table className="tt-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', minWidth: 110 }}>Day</th>
                  {(timetable.schedule[0]?.slots || []).map((slot, i) => (
                    <th key={i}>
                      Period {slot.period}<br />
                      <span style={{ fontWeight: 400, fontSize: '0.68rem' }}>
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.schedule.map((day) => (
                  <tr key={day.day}>
                    <td style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.82rem', padding: '0.5rem' }}>
                      {day.day}
                    </td>
                    {day.slots.map((slot, i) => (
                      <td key={i} className="tt-cell">
                        {slot.type === 'break' ? (
                          <div className="tt-break">☕ Break</div>
                        ) : slot.type === 'free' || !slot.subject ? (
                          <div className="tt-free">—</div>
                        ) : (
                          <div className="tt-slot">
                            <div className="tt-slot-subject">{slot.subject}</div>
                            {slot.staffName && (
                              <div className="tt-slot-staff">👨‍🏫 {slot.staffName}</div>
                            )}
                            {slot.classroom && (
                              <div className="tt-slot-room">🚪 {slot.classroom}</div>
                            )}
                            <span className={`badge badge-${slot.type}`} style={{ marginTop: '0.25rem', fontSize: '0.6rem' }}>
                              {slot.type}
                            </span>
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
      )}
    </div>
  );
}
