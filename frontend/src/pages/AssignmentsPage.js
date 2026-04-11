import { useState, useEffect } from 'react';
import { assignmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  X, 
  Loader2, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  History, 
  ArrowRight,
  ClipboardCheck,
  LayoutGrid,
  AlertTriangle,
  Fingerprint,
  Zap,
  Activity,
  ArrowUpRight,
  Shield,
  ChevronRight
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

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
      toast.error('Identity lattice synchronization failed');
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
      if (!response.ok) throw new Error('System failed to retrieve document stream');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const newWindow = window.open(objectUrl, '_blank');
      if (newWindow) {
        newWindow.onload = () => URL.revokeObjectURL(objectUrl);
      } else {
        toast.error('Portal blocked: Please enable popups for document inspection');
      }
    } catch (error) {
      toast.error(error.message || 'Registry documentation failure');
    } finally {
      setViewLoadingId(null);
    }
  };

  const handleApprove = async (id, statusContext) => {
    if (!window.confirm('Validate and approve institutional allocation?')) return;
    setActionLoading(true);
    try {
      if (isAdmin && statusContext === 'pending') {
        await assignmentAPI.adminApprove(id, { status: 'adminApproved' });
        toast.success('Admin validation complete');
      } else if (isManager && statusContext === 'adminApproved') {
        await assignmentAPI.managerApprove(id, { status: 'managerApproved' });
        toast.success('Final institutional authorization granted');
      }
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authorization protocol failure');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectRemarks.trim()) return toast.error('Rejection logic requires remarks');
    if (!window.confirm('Execute rejection protocol?')) return;
    setActionLoading(true);
    try {
      await assignmentAPI.reject(currentRejectId, { remarks: rejectRemarks });
      toast.success('Allocation rejected and purged from active registry');
      setRejectModalOpen(false);
      setRejectRemarks('');
      setCurrentRejectId(null);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purge protocol failure');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, department) => {
    if (!window.confirm(`Purge allocation for "${department}"? This action is irreversible.`)) return;
    setActionLoading(true);
    try {
      await assignmentAPI.delete(id);
      toast.success('Registry record permanently deleted');
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion protocol failure');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Awaiting Admin', icon: History, cls: 'bg-slate-50 text-slate-400 border-slate-200' },
      adminApproved: { label: 'Admin Validated', icon: ShieldCheck, cls: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-100/50' },
      managerApproved: { label: 'Final Authorized', icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/50' },
      rejected: { label: 'Rejected', icon: XCircle, cls: 'bg-rose-50 text-rose-500 border-rose-100' },
    };
    const info = map[status] || { label: status, icon: History, cls: 'bg-slate-50 text-slate-400 border-slate-200' };
    return (
      <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit ${info.cls}`}>
        <info.icon size={14} />
        {info.label}
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Authorization Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
             <div className="w-1 h-8 bg-indigo-600 rounded-full" />
             <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Allocation <span className="text-indigo-600 font-medium">Registry</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
            Review and authorize subject allocation records for the current cycle.
          </p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-100 rounded-[2.5rem] shadow-sm"
        >
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 mb-6 shadow-inner">
              <FileText size={32} />
           </div>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Null Registry Response</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
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
              <motion.div 
                key={assignment._id} 
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100 flex flex-col justify-between"
              >
                 <div className="space-y-8">
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-inner ${isRejected ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500'}`}>
                             <FileText size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase truncate max-w-[140px]">{assignment.department}</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Node</p>
                          </div>
                       </div>
                       
                       {isAdmin && (
                          <button
                            onClick={() => handleDelete(assignment._id, assignment.department)}
                            disabled={isManagerApproved || actionLoading}
                            className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                       )}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                       {getStatusBadge(assignment.status)}
                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ref Cycle</p>
                             <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{assignment.academicYear}</p>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
                             <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Phase {assignment.semester}</p>
                          </div>
                       </div>
                    </div>

                    <button
                      onClick={() => handleViewPdf(assignment._id)}
                      disabled={viewLoadingId === assignment._id}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2 group/btn active:scale-95 shadow-sm"
                    >
                      {viewLoadingId === assignment._id ? <Activity size={14} className="animate-spin" /> : <Eye size={14} />}
                      {viewLoadingId === assignment._id ? 'Scanning...' : 'Inspect Doc'}
                    </button>

                    <div className="flex items-center gap-2 pt-2">
                       <button
                         disabled={disableActions || actionLoading}
                         onClick={() => handleApprove(assignment._id, assignment.status)}
                         className={`h-12 flex-[2] rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                            disableActions 
                              ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed shadow-none' 
                              : 'bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700 active:scale-95 shadow-indigo-100'
                         }`}
                       >
                         <CheckCircle size={14} /> Authorize
                       </button>
                       <button
                         disabled={disableActions || actionLoading}
                         onClick={() => {
                            setCurrentRejectId(assignment._id);
                            setRejectRemarks('');
                            setRejectModalOpen(true);
                         }}
                         className={`h-12 flex-1 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            disableActions 
                              ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' 
                              : 'bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white active:scale-95'
                         }`}
                       >
                         <XCircle size={14} />
                       </button>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <History size={12} className="text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          Logged {new Date(assignment.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-200" />
                 </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectModalOpen && currentRejectId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setRejectModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="p-10 lg:p-12 space-y-10">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-inner">
                          <AlertTriangle size={32} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Rejection protocol</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Exception Entry</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setRejectModalOpen(false)}
                      disabled={actionLoading}
                      className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
                    >
                       <X size={20} />
                    </button>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Exception Remarks <span className="text-rose-500">*</span></label>
                    <textarea
                      rows="4"
                      placeholder="Specify reasoning: document anomaly, signature verification failed, structural integrity error..."
                      className="saas-input min-h-[140px] py-4 px-6 rounded-2xl text-sm font-medium leading-relaxed bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                      value={rejectRemarks}
                      onChange={(e) => setRejectRemarks(e.target.value)}
                      disabled={actionLoading}
                    />
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button onClick={() => setRejectModalOpen(false)} className="h-14 flex-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                       Abort
                    </button>
                    <button 
                      onClick={handleRejectSubmit} 
                      disabled={actionLoading}
                      className="h-14 flex-[2] bg-rose-600 rounded-xl font-bold text-[11px] text-white uppercase tracking-widest shadow-xl shadow-rose-100 active:scale-95 flex items-center justify-center gap-3"
                    >
                       {actionLoading ? <Activity size={18} className="animate-spin" /> : <XCircle size={18} />}
                       {actionLoading ? 'Executing...' : 'Confirm Rejection'}
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
