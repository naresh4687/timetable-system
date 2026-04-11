import { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Building2, 
  X, 
  Search, 
  History, 
  LayoutGrid, 
  Activity,
  ArrowRight,
  Database,
  Building,
  Layers,
  Cpu,
  Fingerprint,
  Shield,
  Box,
  Layout,
  Globe,
  Settings,
  ArrowUpRight,
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

function DepartmentModal({ department, onClose, onSave }) {
  const [name, setName] = useState(department ? department.name : '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Institutional identification required');
    setLoading(true);
    try {
      if (department) {
        await departmentAPI.update(department._id, { name });
        toast.success('Node recalibrated');
      } else {
        await departmentAPI.create({ name });
        toast.success('New institutional node established');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registry transaction error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
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
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="p-10 lg:p-12 space-y-10">
           <div className="flex items-center justify-between border-b border-slate-100 pb-8">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Building2 size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                       {department ? 'Node Settings' : 'Initialize Node'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       Institutional Structure Registry
                    </p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
              >
                 <X size={20} />
              </button>
           </div>

           <div className="space-y-8 pt-4">
              <div className="space-y-2.5 group">
                 <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block group-focus-within:text-indigo-600 transition-colors">Institutional Segment Title</label>
                 <div className="relative">
                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      autoFocus
                      className="saas-input h-14 pl-12 bg-slate-50 border-slate-200 focus:bg-white" 
                      placeholder="e.g. Architectural Engineering" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                 </div>
                 <div className="flex items-start gap-2.5 mt-4 ml-1">
                    <Activity size={12} className="text-emerald-500 mt-0.5" />
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                       Registration will propagate through all linked administrative nodes in real-time.
                    </p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50">
              <button 
                onClick={onClose} 
                className="h-12 flex-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
              >
                 Abort
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="premium-button h-12 flex-[1.5] rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                 {loading ? <Activity size={18} className="animate-spin" /> : (department ? 'Update Node' : 'Initialize Node')}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await departmentAPI.getAll();
      setDepartments(data);
    } catch (err) {
      toast.error('Institutional synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to purge the institutional node "${name}"? This action cannot be revoked.`)) return;
    try {
      await departmentAPI.delete(id);
      toast.success('Node purged from registry');
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purge protocol failure');
    }
  };

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Domain Lattice...</p>
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
                Structural <span className="text-indigo-600 font-medium">Nodes</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
            Configure institutional segments to optimize automated allocation clusters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full sm:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              className="saas-input pl-11 h-12" 
              placeholder="Search segments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setModal('create')}
            className="premium-button h-12 px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus size={18} /> Initialize Node
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 space-y-6">
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
              <Database size={32} />
           </div>
           <div className="text-center space-y-1">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Null Registry Profile</p>
             <p className="text-xs font-semibold text-slate-300">No segments identified matching your parameters</p>
           </div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((dep) => (
            <motion.div 
              key={dep._id} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100 flex flex-col justify-between"
            >
              <div className="space-y-8">
                 <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 border border-slate-100 shadow-inner group-hover:shadow-indigo-100">
                       <Building2 size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setModal(dep)} className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90">
                          <Pencil size={14} />
                       </button>
                       <button onClick={() => handleDelete(dep._id, dep.name)} className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90">
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-all truncate uppercase">{dep.name}</h3>
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg w-fit">
                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500" />
                       <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Cluster Active</span>
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Provisioned</span>
                    <span className="text-[10px] font-bold text-slate-400">
                       {new Date(dep.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                 </div>
                 <button className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-white hover:border-indigo-100 transition-all group/btn">
                    <ArrowUpRight size={16} className="transition-all group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                 </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {modal && (
          <DepartmentModal
            department={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchDepartments(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
