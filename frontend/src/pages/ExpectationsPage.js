import { useState, useEffect } from 'react';
import { expectationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Trash2, 
  Zap, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Search,
  LayoutDashboard,
  Filter,
  UserCheck,
  MoreVertical,
  ArrowRight,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Building2,
  Activity,
  History,
  ShieldCheck,
  FileText,
  Cpu,
  Layout,
  ArrowUpRight,
  Fingerprint,
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

export default function ExpectationsPage() {
  const [expectations, setExpectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEfficiency, setShowEfficiency] = useState(false);
  const [deficiencies, setDeficiencies] = useState([]);
  const [checking, setChecking] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExpectations = async () => {
    setLoading(true);
    try {
      const { data } = await expectationAPI.getAll();
      setExpectations(data.expectations);
    } catch {
      toast.error('Failed to load expectations directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpectations(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently purge this preference record?')) return;
    try {
      await expectationAPI.delete(id);
      toast.success('Record purged from database');
      fetchExpectations();
    } catch {
      toast.error('Purge operation failed');
    }
  };

  const handleCheckEfficiency = async () => {
    setChecking(true);
    try {
      const { data } = await expectationAPI.getEfficiency(academicYear);
      setDeficiencies(data.deficient || []);
      setShowEfficiency(true);
    } catch (err) {
      toast.error('Efficiency analysis synchronization failed');
    } finally {
      setChecking(false);
    }
  };

  const handleAutoAssign = async (task) => {
    setAssigning(true);
    try {
      await expectationAPI.autoAssign({
         academicYear,
         assignments: [task]
      });
      toast.success('Auto-assignment synchronized');
      handleCheckEfficiency();
      fetchExpectations();
    } catch (err) {
      toast.error('Assignment synchronization failed');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Querying Preferences Matrix...</p>
    </div>
  );

  const filteredExpectations = expectations.filter(exp => 
    exp.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Subject <span className="text-indigo-600 font-medium">Expectations</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
             Monitor staff selections and institutional vacancy metrics across cycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <button 
            onClick={handleCheckEfficiency}
            disabled={checking}
            className="premium-button h-12 px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all w-full sm:w-auto"
          >
            {checking ? <Activity className="animate-spin" size={16} /> : <Zap size={16} />}
            Analyze Coverage
          </button>
          
          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-4 h-12 shadow-sm">
             <div className="px-5 h-full flex flex-col justify-center bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Records</span>
                <span className="text-[11px] font-bold text-slate-700 tracking-widest leading-none">{expectations.length} Staff</span>
             </div>
             <div className="pr-3">
               <Users size={18} className="text-indigo-600" />
             </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2 shadow-sm"
      >
        <div className="relative group flex-1 min-w-[300px]">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
           <input
             placeholder="Search by staff name or department..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-12 bg-transparent border-none rounded-xl pl-13 pr-6 text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:bg-slate-50 transition-all"
           />
        </div>
        <div className="hidden lg:block w-px h-6 bg-slate-100 mx-2" />
        <select 
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 focus:text-slate-900 focus:border-indigo-500 outline-none cursor-pointer hover:bg-white transition-all w-full lg:w-48 appearance-none text-center"
        >
          <option value="2025-2026">2025-26 Cycle</option>
          <option value="2024-2025">2024-25 Cycle</option>
        </select>
      </motion.div>

      {/* Main Grid */}
      {filteredExpectations.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-100 rounded-[2.5rem] shadow-sm"
        >
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 mb-6 shadow-inner">
              <ClipboardList size={32} />
           </div>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Null Registry Response</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          {filteredExpectations.map((exp) => (
            <motion.div 
              key={exp._id} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-8 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 border border-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100 transition-all duration-300 group-hover:scale-105">
                        {exp.staffName?.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg border border-slate-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-200" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{exp.staffName}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                         <div className="flex items-center gap-1.5">
                           <Building2 size={13} className="text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{exp.department}</span>
                         </div>
                         <div className="w-px h-3 bg-slate-100" />
                         <span className="text-[10px] font-bold text-slate-300 truncate max-w-[140px] leading-none">{exp.staffId?.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {exp.academicYear}
                    </div>
                    <button 
                      onClick={() => handleDelete(exp._id)}
                      className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 px-1">
                       <BookOpen size={14} className="text-indigo-600" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Theory Selection</span>
                    </div>
                    <div className="space-y-2">
                      {exp.preferredTheorySubjects?.map((s, i) => (
                        <div key={i} className="flex flex-col bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all duration-300 shadow-sm relative overflow-hidden group/item">
                           <span className="text-[12px] font-bold text-slate-800 leading-tight uppercase tracking-tight group-hover/item:text-indigo-600 transition-colors">{s.subject}</span>
                           <div className="flex items-center gap-2 mt-2.5">
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-lg uppercase tracking-widest border border-indigo-100">PHASE {s.semester}</span>
                              <span className="px-2 py-1 bg-white text-slate-400 text-[9px] font-bold rounded-lg uppercase tracking-widest border border-slate-100 shadow-sm">SEC {s.section}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 px-1">
                       <FlaskConical size={14} className="text-emerald-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Lab Selection</span>
                    </div>
                    <div className="space-y-2">
                      {exp.preferredLabSubjects?.length > 0 ? (
                        exp.preferredLabSubjects.map((s, i) => (
                          <div key={i} className="flex flex-col bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-white transition-all duration-300 shadow-sm relative overflow-hidden group/item">
                            <span className="text-[12px] font-bold text-slate-800 leading-tight uppercase tracking-tight group-hover/item:text-emerald-600 transition-colors">{s.subject}</span>
                            <div className="flex items-center gap-2 mt-2.5">
                               <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-lg uppercase tracking-widest border border-emerald-100">PHASE {s.semester}</span>
                               <span className="px-2 py-1 bg-white text-slate-400 text-[9px] font-bold rounded-lg uppercase tracking-widest border border-slate-100 shadow-sm">SEC {s.section}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 opacity-60">
                           <Activity size={18} className="text-slate-200 mb-2" />
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Null Lab Node</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {exp.additionalNotes && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <History size={12} className="text-indigo-400" /> Administrative Notes
                     </p>
                     <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"{exp.additionalNotes}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Analysis Modal */}
      <AnimatePresence>
        {showEfficiency && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEfficiency(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[95vh]"
            >
              <div className="p-8 lg:p-10 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                      <Cpu size={28} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Coverage Terminal</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                        <Activity size={14} className="text-indigo-600 animate-pulse" />
                        Dynamic Gap Analysis Matrix
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => setShowEfficiency(false)}
                  className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 lg:p-10 overflow-y-auto no-scrollbar flex-1 bg-slate-50/30">
                {deficiencies.length === 0 ? (
                  <div className="py-24 flex flex-col items-center text-center gap-8">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-xl shadow-emerald-100">
                      <ShieldCheck size={48} className="text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-xl font-bold text-slate-900 tracking-tight">Lattice Synchronized</p>
                       <p className="text-sm font-medium text-slate-400 uppercase tracking-widest italic">100% Allocation Capacity Maintained.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 flex items-center gap-8 shadow-sm relative overflow-hidden">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100 shrink-0 border border-rose-200">
                        <AlertTriangle className="text-rose-500 animate-pulse" size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-slate-900 leading-none">Institutional Gaps Found</p>
                        <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest">{deficiencies.length} Unassigned course modules detected.</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {deficiencies.map((d) => (
                        <div key={d.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-300 transition-all duration-300 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                          <div className="flex items-center gap-8 flex-1">
                             <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shadow-lg transition-all duration-300 border ${d.type === 'theory' ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-100' : 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-100'}`}>
                               <span className="text-[8px] uppercase leading-none mb-1 opacity-80">{d.type}</span>
                               <span className="text-2xl leading-none">{d.section}</span>
                             </div>
                             <div className="space-y-2">
                               <h5 className="text-lg font-bold text-slate-900 leading-none tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{d.subject}</h5>
                               <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                     <GraduationCap size={14} className="text-slate-300" />
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Phase {d.semester}</span>
                                  </div>
                                  <div className="w-px h-3 bg-slate-100" />
                                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">Unit {d.section}</span>
                               </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                             {d.suggestions.length > 0 ? d.suggestions.map(s => (
                               <button 
                                 key={s._id} 
                                 onClick={() => handleAutoAssign({
                                   staffId: s._id,
                                   subject: d.subject,
                                   semester: d.semester,
                                   section: d.section,
                                   type: d.type
                                 })}
                                 disabled={assigning}
                                 className="h-11 px-6 bg-slate-50 border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                               >
                                 <UserCheck size={16} />
                                 Assign {s.name}
                               </button>
                             )) : (
                               <div className="h-11 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center">
                                 Capacity Exhausted
                               </div>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 flex items-center justify-end bg-white">
                <button 
                  onClick={() => setShowEfficiency(false)}
                  className="h-14 px-10 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                >
                  Close Terminal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
