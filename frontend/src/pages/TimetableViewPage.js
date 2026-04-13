import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { timetableAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeTo12H } from '../utils/timeUtils';
import { 
  ArrowLeft, 
  Download, 
  Pencil, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  BookOpen, 
  CalendarDays,
  Clock,
  MapPin,
  Coffee,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  Layout,
  History,
  FileText,
  Activity,
  UserCheck,
  Zap,
  ArrowUpRight,
  Maximize2,
  ArrowRight,
  Shield,
  LayoutGrid
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const rowVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function TimetableViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    timetableAPI.getById(id)
      .then(({ data }) => setTimetable(data.timetable))
      .catch(() => toast.error('Failed to load timetable record'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    const toastId = toast.loading('Synchronizing PDF generation...');
    try {
      await timetableAPI.downloadPDF(id, `timetable-${timetable.department}-sem${timetable.semester}.pdf`);
      toast.success('Document exported successfully', { id: toastId });
    } catch {
      toast.error('Export failed', { id: toastId });
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (newStatus === 'rejected') {
        const reason = window.prompt('Enter institutional reason for rejection:');
        if (reason === null) return;
        await timetableAPI.updateStatus(id, { status: newStatus, rejectionReason: reason });
      } else {
        if (!window.confirm('Validate and formally approve this architecture?')) return;
        await timetableAPI.updateStatus(id, { status: newStatus });
      }
      toast.success(`Registry updated: ${newStatus.toUpperCase()}`);
      const { data } = await timetableAPI.getById(id);
      setTimetable(data.timetable);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Protocol synchronization failure');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Analyzing Grid Topology...</p>
    </div>
  );
  
  if (!timetable) return (
    <div className="flex flex-col items-center justify-center py-40 text-center gap-6">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
        <CalendarDays size={32} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Node Not Found</h3>
        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-1">The requested record is missing from the registry.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-6">
          <motion.button 
            whileHover={{ x: -2 }}
            onClick={() => navigate('/timetables')}
            className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-[10px] group transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Registry Directory
          </motion.button>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-slate-900 tracking-tight leading-none uppercase"
            >
              {timetable.title}
            </motion.h1>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                 <Building2 size={13} className="text-indigo-600" /> {timetable.department}
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                 <BookOpen size={13} className="text-indigo-600" /> Phase {timetable.semester}
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                 Section {timetable.section}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                 {timetable.academicYear}
              </div>
              <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold border flex items-center gap-2 shadow-sm transition-all ${timetable.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : timetable.status === 'rejected' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${timetable.status === 'approved' ? 'bg-emerald-500 animate-pulse' : timetable.status === 'rejected' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                {(timetable.status || 'Provisional').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={handleDownload}
            className="h-12 px-6 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm group"
          >
            <Download size={18} className="text-indigo-600" />
            Export PDF
          </button>

          {user.role === 'admin' && (
            <button 
              onClick={() => navigate(`/timetables/${id}/edit`)}
              className="h-12 px-6 bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
            >
              <Pencil size={18} />
              Modify
            </button>
          )}

          {user.role === 'manager' && (timetable.status === 'draft' || !timetable.status) && (
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => handleStatusUpdate('approved')}
                className="h-12 flex-1 lg:px-8 bg-emerald-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Authorize
              </button>
              <button 
                onClick={() => handleStatusUpdate('rejected')}
                className="h-12 flex-1 lg:px-8 bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Alert */}
      {timetable.status === 'rejected' && timetable.rejectionReason && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-start gap-5 shadow-sm"
        >
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 shrink-0 border border-rose-200">
            <AlertTriangle className="text-rose-500 animate-pulse" size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Administrative Exception Detected</p>
            <p className="text-sm font-medium text-slate-600 italic leading-relaxed">Reason: {timetable.rejectionReason}</p>
          </div>
        </motion.div>
      )}

      {/* Main Grid Workspace */}
      {timetable.schedule.length === 0 ? (
        <div className="bg-white flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <Layout size={32} className="text-slate-200" />
          </div>
          <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Topology Unpopulated</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-8 text-left border-b border-slate-100 whitespace-nowrap min-w-[160px] bg-slate-50 sticky left-0 z-10 font-bold text-[11px] uppercase text-slate-400 tracking-widest">
                    Time Axis
                  </th>
                  {(timetable.schedule[0]?.slots || []).map((slot, i) => (
                    <th key={i} className="p-8 text-center border-b border-slate-100 min-w-[220px]">
                      <div className="space-y-1.5">
                        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Phase {slot.period}</div>
                        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-indigo-600 tracking-tight">
                           <Clock size={12} /> {formatTimeTo12H(slot.startTime)} – {formatTimeTo12H(slot.endTime)}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {timetable.schedule.map((day) => (
                  <motion.tr 
                    key={day.day} 
                    variants={rowVariants}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="p-8 bg-white border-r border-slate-100 sticky left-0 z-10 font-bold text-slate-900 text-sm uppercase">
                      {day.day}
                    </td>
                    
                    {day.slots.map((slot, i) => (
                      <td key={i} className={`p-3 border-b border-slate-50 ${slot.type === 'break' ? 'bg-slate-50/30' : ''}`}>
                        {slot.type === 'break' ? (
                          <div className="h-full flex flex-col items-center justify-center gap-2 py-6 opacity-30">
                            <Coffee size={22} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Break</span>
                          </div>
                        ) : slot.type === 'free' || !slot.subject ? (
                          <div className="h-full flex items-center justify-center py-10 opacity-10">
                             <div className="w-8 h-0.5 bg-slate-300 rounded-full" />
                          </div>
                        ) : (
                          <motion.div 
                            whileHover={{ y: -2 }}
                            className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-5 shadow-sm hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="space-y-2.5">
                               <div className="flex items-start justify-between gap-3">
                                 <h5 className="text-[13px] font-bold text-slate-900 tracking-tight uppercase leading-tight line-clamp-2">{slot.subject}</h5>
                                 {slot.categoryUsed && (
                                   <div className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[9px] font-bold tracking-widest shrink-0">
                                     {slot.categoryUsed}
                                   </div>
                                 )}
                               </div>
                               <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-300">
                                  <div className={`w-1.5 h-1.5 rounded-full ${slot.type === 'lab' ? 'bg-emerald-500' : 'bg-indigo-600'}`} />
                                  {slot.type} Block
                               </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-slate-50">
                               {slot.staffName && (
                                 <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                    <UserCheck size={13} className="text-indigo-600 shrink-0" />
                                    <span className="line-clamp-1">{slot.staffName}</span>
                                 </div>
                               )}
                               {slot.classroom && (
                                 <div className="flex items-center gap-2.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                                    <MapPin size={13} className="text-slate-300 shrink-0" />
                                    <span className="line-clamp-1">{slot.classroom}</span>
                                 </div>
                               )}
                            </div>
                          </motion.div>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Footer Branding */}
      <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
               <ShieldCheck className="text-indigo-600" size={28} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Integrity Verified</p>
               <p className="text-[11px] font-medium text-slate-500 max-w-sm uppercase tracking-tight">
                 Architectural snapshot for operational deployment. {timetable.status === 'approved' ? "Deployment credentials active." : "Locked for review."}
               </p>
            </div>
         </div>
         <div className="flex items-center gap-4 shrink-0">
            <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl shadow-inner text-center">
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Status</span>
               <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase italic">Optimized_Sync</span>
            </div>
            <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl shadow-inner text-center">
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Rev.</span>
               <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">V{timetable.version || '1.0'}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
