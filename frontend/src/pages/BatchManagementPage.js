import { useState, useEffect } from 'react';
import { batchAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GraduationCap, 
  X, 
  Calendar, 
  Layers, 
  Hash, 
  History, 
  ArrowRight,
  Save,
  Clock,
  LayoutGrid,
  Zap,
  Cpu,
  Fingerprint,
  ArrowUpRight,
  Activity,
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

function BatchModal({ batch, onClose, onSave }) {
  const [startYear, setStartYear] = useState(batch ? batch.startYear : '');
  const [endYear, setEndYear] = useState(batch ? batch.endYear : '');
  const [sections, setSections] = useState(batch ? batch.sections : [{ name: 'A' }]);
  const [numSections, setNumSections] = useState(batch ? batch.sections.length : 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (startYear && !batch) {
        const start = parseInt(startYear);
        if (!isNaN(start)) {
            setEndYear(start + 4);
        }
    }
  }, [startYear, batch]);

  const handleNumSectionsChange = (val) => {
    const num = parseInt(val) || 0;
    setNumSections(val);
    if (num > 0 && num <= 26) {
        const newSections = Array.from({ length: num }, (_, i) => ({
            name: String.fromCharCode(65 + i)
        }));
        setSections(newSections);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { name: '' }]);
  };

  const handleRemoveSection = (idx) => {
    if (sections.length <= 1) return toast.error('Minimum unit requirement: At least one section must exist');
    setSections(sections.filter((_, i) => i !== idx));
    setNumSections(sections.length - 1);
  };

  const updateSectionName = (idx, name) => {
    const next = [...sections];
    next[idx].name = name.toUpperCase();
    setSections(next);
  };

  const handleSave = async () => {
    if (!startYear || !endYear) return toast.error('Cohort timeline identification required');
    if (parseInt(endYear) <= parseInt(startYear)) return toast.error('Timeline anomaly: End year must exceed start year');
    if (sections.some(s => !s.name.trim())) return toast.error('Identifier missing: All nodes must be named');
    
    const names = sections.map(s => s.name.trim());
    if (new Set(names).size !== names.length) return toast.error('Registry clash: Duplicate node identifiers detected');

    setLoading(true);
    try {
      const payload = { 
        startYear: Number(startYear), 
        endYear: Number(endYear), 
        sections: sections.map(s => ({ name: s.name.trim() })) 
      };

      if (batch) {
        await batchAPI.update(batch._id, payload);
        toast.success('Cohort registry recalibrated');
      } else {
        await batchAPI.create(payload);
        toast.success('New cohort established in registry');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registry transaction error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 lg:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
      >
        <div className="p-10 lg:p-12 overflow-y-auto no-scrollbar space-y-10">
           <div className="flex items-center justify-between border-b border-slate-100 pb-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Calendar size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                       {batch ? 'Update Cohort' : 'Establish Cohort'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       Institutional Lifecycle Terminal
                    </p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
              >
                 <X size={24} />
              </button>
           </div>

           <div className="space-y-10">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Inception Year</label>
                    <div className="relative">
                       <History className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input 
                         type="number"
                         autoFocus
                         className="saas-input h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white" 
                         placeholder="e.g. 2023" 
                         value={startYear}
                         onChange={(e) => setStartYear(e.target.value)}
                       />
                    </div>
                 </div>
                 <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Graduation Year</label>
                    <div className="relative">
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input 
                         type="number"
                         className="saas-input h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white" 
                         placeholder="e.g. 2027" 
                         value={endYear}
                         onChange={(e) => setEndYear(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-2.5">
                 <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Node Cluster Capacity</label>
                 <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="number"
                      min="1" max="26"
                      className="saas-input h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white text-center font-bold tracking-widest" 
                      placeholder="Enter section count..." 
                      value={numSections}
                      onChange={(e) => handleNumSectionsChange(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2 mt-2 ml-1">
                    <Zap size={12} className="text-indigo-400" />
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Identifiers (A, B, C...) will be auto-generated.</p>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <Layers size={18} className="text-indigo-600" />
                       <span className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Active Node Schema</span>
                    </div>
                    <button onClick={handleAddSection} className="h-9 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                       Add Custom Node
                    </button>
                 </div>
                 
                 <div className="flex flex-wrap gap-2.5 pt-2">
                    {sections.map((s, idx) => (
                       <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={idx} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-all"
                       >
                          <input 
                            value={s.name} 
                            onChange={(e) => updateSectionName(idx, e.target.value)}
                            className="w-8 bg-transparent text-center font-bold text-slate-900 text-sm border-none outline-none focus:text-indigo-600"
                            placeholder="?"
                          />
                          <button onClick={() => handleRemoveSection(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                             <X size={14} />
                          </button>
                       </motion.div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
              <button 
                onClick={onClose} 
                className="h-14 flex-1 bg-white border border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
              >
                 Abort
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="premium-button h-14 flex-[2] rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                 {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                 <span className="uppercase tracking-widest">{loading ? 'Syncing...' : (batch ? 'Update Cohort' : 'Establish Cohort')}</span>
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function BatchManagementPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const { data } = await batchAPI.getAll();
      setBatches(data);
    } catch (err) {
      toast.error('Identity registry sync cluster failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleDelete = async (id, startYear, endYear) => {
    if (!window.confirm(`Are you sure you want to purge the institutional cohort "${startYear} – ${endYear}"?`)) return;
    try {
      await batchAPI.delete(id);
      toast.success('Cohort purged from historical record');
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purge protocol failure');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Cohort Timeline Registry...</p>
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
                Student <span className="text-indigo-600 font-medium">Cohorts</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
             Manage institutional timeline topologies, student clusters, and section hierarchies.
          </p>
        </div>

        <button 
          onClick={() => setModal('create')}
          className="premium-button h-12 px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus size={18} /> Establish Cohort
        </button>
      </div>

      {batches.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-100 rounded-[2.5rem] shadow-sm"
        >
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 mb-6 shadow-inner">
              <GraduationCap size={32} />
           </div>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Null Cohort Registry</p>
           <button onClick={() => setModal('create')} className="text-indigo-600 font-bold uppercase tracking-widest text-[11px] hover:underline flex items-center gap-2">
              <Plus size={14} /> Initialize lifecycle node
           </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {batches.map((b) => (
            <motion.div 
              key={b._id} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100 flex flex-col justify-between"
            >
              <div className="space-y-8">
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-inner group-hover:shadow-indigo-100">
                          <Calendar size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase">{b.startYear} <span className="text-slate-200 font-medium">—</span> {b.endYear}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-emerald-200 shadow-lg animate-pulse" />
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                Institutional Cycle
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button onClick={() => setModal(b)} className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white transition-all active:scale-90 shadow-sm hover:border-indigo-100">
                          <Pencil size={14} />
                       </button>
                       <button onClick={() => handleDelete(b._id, b.startYear, b.endYear)} className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm border-rose-100">
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <Layers size={14} className="text-indigo-500" /> Managed Node Lattice
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                       {b.sections && b.sections.map((s, i) => (
                         <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all shadow-sm">
                            NODE {s.name}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <History size={12} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                       Synced {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                 </div>
                 <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group/nav">
                    Inspect <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                 </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {modal && (
          <BatchModal
            batch={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchBatches(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
