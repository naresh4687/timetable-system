import { useState, useEffect } from 'react';
import { assignmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LuEye, LuCircleCheck, LuCircleX, LuX, LuLoader, LuTrash2 } from 'react-icons/lu';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [viewLoadingId, setViewLoadingId] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await assignmentAPI.getAll();
      setAssignments(data);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (id) => {
    setViewLoadingId(id);
    try {
      const response = await fetch(`${assignmentAPI.getPDFUrl(id)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to load PDF');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const newWindow = window.open(objectUrl, '_blank');
      if (newWindow) {
        newWindow.onload = () => URL.revokeObjectURL(objectUrl);
      } else {
        toast.error('Please allow popups for this site');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to open PDF');
    } finally {
      setViewLoadingId(null);
    }
  };

  const handleApprove = async (id, statusContext) => {
    if (!window.confirm('Are you sure you want to approve this assignment?')) return;
    setActionLoading(true);
    try {
      if (isAdmin && statusContext === 'pending') {
        await assignmentAPI.adminApprove(id, { status: 'adminApproved' });
        toast.success('Assignment Approved by Admin');
      } else if (isManager && statusContext === 'adminApproved') {
        await assignmentAPI.managerApprove(id, { status: 'managerApproved' });
        toast.success('Assignment Final Approved by Manager');
      }
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectRemarks.trim()) {
      toast.error('Remarks are required for rejection.');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this assignment?')) return;
    setActionLoading(true);
    try {
      await assignmentAPI.reject(currentRejectId, { remarks: rejectRemarks });
      toast.success('Assignment Rejected successfully');
      setRejectModalOpen(false);
      setRejectRemarks('');
      setCurrentRejectId(null);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, department) => {
    if (!window.confirm(`Are you sure you want to delete the assignment for "${department}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await assignmentAPI.delete(id);
      toast.success('Assignment deleted successfully');
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Pending', cls: 'badge-pending' },
      adminApproved: { label: 'Admin Approved', cls: 'badge-adminApproved' },
      managerApproved: { label: 'Manager Approved', cls: 'badge-managerApproved' },
      rejected: { label: 'Rejected', cls: 'badge-rejected' },
    };
    const info = map[status] || { label: status, cls: 'badge-draft' };
    return <span className={`badge ${info.cls}`}>{info.label}</span>;
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subject Allocated Approvals</h1>
          <p className="page-subtitle">Review and approve subject allocation records</p>
        </div>
      </div>

      <div className="table-wrap">
        {assignments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Details</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => {
                const s = assignment.status;
                const isPending = s === 'pending';
                const isAdminApproved = s === 'adminApproved';
                const isManagerApproved = s === 'managerApproved';
                const isRejected = s === 'rejected';
                const canAdminApproveReject = isAdmin && isPending;
                const canManagerApproveReject = isManager && isAdminApproved;
                const canAct = canAdminApproveReject || canManagerApproveReject;
                const disableActions = isManagerApproved || isRejected || !canAct;

                return (
                  <tr key={assignment._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>{assignment.department}</div>
                      <div className="text-sm text-muted">Year: {assignment.academicYear} • Sem: {assignment.semester}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Submitted: {new Date(assignment.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{getStatusBadge(assignment.status)}</td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewPdf(assignment._id)}
                          disabled={viewLoadingId === assignment._id}
                        >
                          {viewLoadingId === assignment._id ? <LuLoader size={14} className="spin" /> : <LuEye size={14} />}
                          {viewLoadingId === assignment._id ? 'Loading...' : 'View'}
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          disabled={disableActions || actionLoading}
                          onClick={() => handleApprove(assignment._id, assignment.status)}
                        >
                          <LuCircleCheck size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={disableActions || actionLoading}
                          onClick={() => {
                            setCurrentRejectId(assignment._id);
                            setRejectRemarks('');
                            setRejectModalOpen(true);
                          }}
                        >
                          <LuCircleX size={14} /> Reject
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={isManagerApproved || actionLoading}
                            onClick={() => handleDelete(assignment._id, assignment.department)}
                            title={isManagerApproved ? 'Cannot delete a fully approved assignment' : 'Delete assignment'}
                          >
                            <LuTrash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <span className="icon"><LuCircleCheck size={40} /></span>
            <p>No subject allocated records found.</p>
          </div>
        )}
      </div>

      {/* Reject Remarks Modal */}
      {rejectModalOpen && currentRejectId && (
        <div className="modal-overlay" onClick={() => !actionLoading && setRejectModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--danger)' }}>
                <LuCircleX size={20} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Reject Assignment
              </h3>
              <button className="modal-close" disabled={actionLoading} onClick={() => setRejectModalOpen(false)}>
                <LuX size={20} />
              </button>
            </div>
            <div className="form-group">
              <label>Please provide remarks for rejection <span style={{ color: 'var(--danger)' }}>*</span></label>
              <textarea
                rows="4"
                placeholder="Missing faculty signature, incorrect subjects..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" disabled={actionLoading} onClick={() => setRejectModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" disabled={actionLoading} onClick={handleRejectSubmit}>
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
