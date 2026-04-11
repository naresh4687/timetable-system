import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timetableAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { semLabel } from '../utils/semesterUtils';
import { 
  Plus, 
  Eye, 
  Download, 
  Pencil, 
  Trash2, 
  CalendarDays, 
  Building2, 
  BookOpen, 
  Search,
  Filter,
  X,
  LayoutGrid,
  ChevronRight,
  User,
  Clock,
  FileText,
  Activity,
  History,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  RotateCcw,
  ChevronDown
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
      toast.error('Failed to load scheduling registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimetables(); }, [filters]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently purge timetable "${title}" from the registry?`)) return;
    try {
      await timetableAPI.delete(id);
      toast.success('Record purged from database');
      fetchTimetables();
    } catch (err) {
      toast.error('Purge operation protocol failure');
    }
  };

  const handleDownload = async (id, dept, sem) => {
    const toastId = toast.loading('Synchronizing PDF generation...');
    try {
      await timetableAPI.downloadPDF(id, `timetable-${dept}-sem${sem}.pdf`);
      toast.success('Document exported successfully', { id: toastId });
    } catch (err) {
      toast.error('Export failed', { id: toastId });
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
             <div className="w-1 h-8 bg-indigo-600 rounded-full" />
             <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Scheduling <span className="text-indigo-600 font-medium">Registry</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
            Authorize and manage institutional academic schedules across departments.
          </p>
        </div>

        {canEdit && (
          <button 
            onClick={() => navigate('/timetables/new')}
            className="premium-button h-12 px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all w-full lg:w-auto"
          >
            <Plus size={18} /> Initialize Protocol
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-2"
      >
        <div className="relative group flex-[2] w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            placeholder="Search by department or title..."
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
            className="saas-input h-12 bg-slate-50 border-transparent pl-12 pr-6 text-[11px] font-bold tracking-widest uppercase focus:bg-white focus:border-indigo-200 transition-all rounded-xl shadow-inner placeholder:text-slate-300"
          />
        </div>
        
        <div className="relative flex-1 w-full lg:w-64">
           <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
           <select 
             value={filters.semester} 
             onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}
             className="saas-input h-12 w-full pl-12 pr-6 bg-slate-50 border-transparent text-[11px] font-bold uppercase tracking-widest text-slate-500 focus:bg-white focus:border-indigo-200 cursor-pointer transition-all appearance-none rounded-xl shadow-inner"
           >
             <option value="">All Cycles</option>
             {[1,2,3,4,5,6,7,8].map((s) => (
               <option key={s} value={s}>{semLabel(s).toUpperCase()}</option>
             ))}
           </select>
           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        <button 
          onClick={() => setFilters({ department: '', semester: '' })}
          className="h-12 px-5 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </motion.div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
           </div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Analyzing Registry Vault...</p>
        </div>
      ) : timetables.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-100 rounded-[2.5rem] shadow-sm"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <CalendarDays size={32} className="text-slate-200" />
          </div>
          <p className="text-sm font-bold text-slate-300 uppercase tracking-widest italic">Registry Null Response</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4"
        >
          {timetables.map((tt) => (
            <motion.div 
              key={tt._id} 
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="group bg-white rounded-[2.5rem] border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100 flex flex-col lg:flex-row lg:items-center overflow-hidden"
            >
              <div className="p-8 lg:px-10 lg:py-8 flex flex-col lg:flex-row lg:items-center gap-8 flex-1">
                {/* Cycle Indicator */}
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold border transition-all duration-300 group-hover:scale-105 shrink-0 shadow-sm ${tt.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : tt.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <span className="text-[8px] uppercase tracking-widest leading-none mb-1 opacity-60">Cycle</span>
                  <span className="text-xl leading-none">{tt.semester}</span>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight uppercase group-hover:text-indigo-600 transition-colors">{tt.title}</h4>
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${tt.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : tt.status === 'rejected' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      <div className={`w-1 h-1 rounded-full ${tt.status === 'approved' ? 'bg-emerald-500' : tt.status === 'rejected' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                      {tt.status || 'PROVISIONAL'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                       <Building2 size={13} className="text-indigo-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tt.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <FileText size={13} className="text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section {tt.section}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <History size={13} className="text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{tt.academicYear}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-8 lg:px-10 lg:py-8 lg:border-l border-slate-100 flex flex-wrap lg:flex-nowrap items-center gap-3 bg-slate-50/20 group-hover:bg-white transition-colors">
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <button 
                    onClick={() => navigate(`/timetables/${tt._id}`)}
                    className="h-11 flex-1 lg:flex-none lg:px-5 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm group/btn"
                  >
                    <Eye size={15} className="text-indigo-600" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDownload(tt._id, tt.department, tt.semester)}
                    className="h-11 flex-1 lg:flex-none lg:px-5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    <Download size={15} />
                    PDF
                  </button>
                </div>
                
                {canEdit && (
                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    <button 
                      onClick={() => navigate(`/timetables/${tt._id}/edit`)}
                      className="h-11 flex-1 lg:flex-none lg:px-6 bg-slate-900 text-white hover:bg-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(tt._id, tt.title)}
                        className="h-11 w-11 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 flex items-center justify-center active:scale-95 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
