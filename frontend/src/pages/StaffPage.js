import { useState, useEffect } from 'react';
import { userAPI, departmentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  GraduationCap, 
  Save, 
  Building2, 
  Mail, 
  ShieldCheck, 
  Layers, 
  UserCheck, 
  Activity,
  History,
  Key,
  Fingerprint,
  RotateCcw,
  Cpu,
  Database,
  Layout,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';

const emptyForm = () => ({
  name: '',
  email: '',
  password: '',
  department: '',
  role: 'staff',
  category: 'B',
  handledSemesters: [],
  isActive: true,
});

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

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [staffRes, depsRes] = await Promise.all([
        userAPI.getStaff(),
        departmentAPI.getAll()
      ]);
      setStaff(staffRes.data.staff);
      setDepartments(depsRes.data);
    } catch (err) {
      toast.error('Directory synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openCreate = () => { 
    const defaultDep = departments[0]?.name || '';
    setForm({ ...emptyForm(), department: defaultDep });
    setEditingId(null); 
    setShowModal(true); 
  };

  const openEdit = (s) => {
    setForm({
      name: s.name, email: s.email, password: '', department: s.department || '',
      role: s.role, category: s.category || 'B', 
      handledSemesters: s.handledSemesters || [], isActive: s.isActive,
    });
    setEditingId(s._id);
    setShowModal(true);
  };

  const toggleSemester = (sem) => {
    setForm((f) => {
      const exists = f.handledSemesters.includes(sem);
      return {
        ...f,
        handledSemesters: exists
          ? f.handledSemesters.filter((s) => s !== sem)
          : [...f.handledSemesters, sem].sort((a, b) => a - b),
      };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Identification credentials required'); return; }
    if (!editingId && !form.password) { toast.error('Security key required for new personnel'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editingId) {
        await userAPI.update(editingId, payload);
        toast.success('Personnel record updated');
      } else {
        await userAPI.create(payload);
        toast.success('Personnel successfully onboarded');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction registry failure');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate personnel record?')) return;
    try { await userAPI.delete(id); toast.success('Record purged'); fetchStaff(); }
    catch { toast.error('Transaction failure'); }
  };

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Personnel Directory...</p>
    </div>
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
                Personnel <span className="text-indigo-600 font-medium">Directory</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
             Manage institutional identities, departmental clusters, and pedagogical assignments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full lg:w-[360px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              className="saas-input pl-12 h-12 w-full" 
              placeholder="Search faculty identity..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={openCreate}
            className="premium-button h-12 px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all w-full sm:w-auto"
          >
            <UserPlus size={16} /> Onboard Faculty
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center py-40"
        >
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 mb-6">
              <Database size={32} />
           </div>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Zero Personnel Matches Found</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filtered.map((s) => (
            <motion.div 
              key={s._id} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100 flex flex-col justify-between"
            >
              <div className="space-y-8">
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner transition-all duration-300 ${s.category === 'A' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                          {s.name.charAt(0)}
                       </div>
                       <div>
                           <div className="space-y-1">
                              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors truncate max-w-[140px]">{s.name}</h3>
                              <div className="flex items-center gap-2">
                                 <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest leading-none border ${s.category === 'A' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                    CLASS_{s.category || 'B'}
                                 </span>
                                 {!s.isActive && (
                                   <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-lg">
                                      <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
                                      <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest leading-none">Locked</span>
                                   </div>
                                 )}
                              </div>
                           </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button 
                         onClick={() => openEdit(s)}
                         className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                       >
                          <Pencil size={14} />
                       </button>
                       <button 
                         onClick={() => handleDelete(s._id)}
                         className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                             <Building2 className="text-indigo-500/50" size={14} />
                             <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-none">
                                {s.department || 'GENERAL CLUSTER'}
                             </span>
                          </div>
                          <p className="text-[10px] font-semibold text-slate-300 truncate max-w-[110px]">
                            {s.email}
                          </p>
                       </div>

                       <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                          {s.handledSemesters?.length > 0 ? s.handledSemesters.map(sem => (
                            <div key={sem} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 tracking-tight group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
                               Semester {sem}
                            </div>
                          )) : (
                            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                               <Cpu size={12} className="opacity-50" /> No Phase Assignments
                            </span>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                       <History size={11} />
                       <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Registry Logged</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors group/nav">
                      Structure <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Staff Onboarding Terminal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(15,23,42,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
            >
               <div className="p-10 lg:p-12 overflow-y-auto no-scrollbar space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-10">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                           {editingId ? <RotateCcw size={28} /> : <UserPlus size={28} />}
                        </div>
                        <div>
                           <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                              {editingId ? 'Edit Faculty Profile' : 'Onboard New Node'}
                           </h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Registry Terminal</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => setShowModal(false)}
                       className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  <div className="space-y-10">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Faculty Full Name</label>
                           <input 
                             className="saas-input bg-slate-50 border-slate-100 focus:bg-white" 
                             value={form.name} 
                             onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                             placeholder="e.g. Dr. Jordan Smith" 
                           />
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Official Identifier (Email)</label>
                           <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <input 
                                className="saas-input pl-11 bg-slate-50 border-slate-100 focus:bg-white" 
                                value={form.email} 
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
                                placeholder="name@institution.edu" 
                              />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">
                              {editingId ? 'Credential Recalibration' : 'Initial Security Token'}
                           </label>
                           <div className="relative">
                              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <input 
                                type="password" 
                                className="saas-input pl-11 bg-slate-50 border-slate-100 focus:bg-white" 
                                value={form.password} 
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} 
                                placeholder="Min. 8 characters" 
                              />
                           </div>
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Department Cluster</label>
                           <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <select 
                                className="saas-input pl-11 bg-slate-50 border-slate-100 focus:bg-white appearance-none cursor-pointer"
                                value={form.department} 
                                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                              >
                                {departments.map(d => <option key={d._id} value={d.name}>{d.name.toUpperCase()}</option>)}
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <ShieldCheck className="text-indigo-600" size={20} />
                           <div className="space-y-0.5">
                             <h4 className="text-sm font-bold text-slate-900">Administrative Hierarchy</h4>
                             <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Access Level Classification</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                          {['A', 'B'].map(cat => (
                            <button 
                              key={cat}
                              onClick={() => setForm(f => ({ ...f, category: cat }))}
                              className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${form.category === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900'}`}
                            >
                               Class {cat}
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3 ml-1">
                           <Layers size={16} className="text-indigo-400" />
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedagogical Phasing (Semesters)</h4>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                           {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                             const selected = form.handledSemesters.includes(sem);
                             return (
                               <button
                                 key={sem} 
                                 type="button" 
                                 onClick={() => toggleSemester(sem)}
                                 className={`h-12 rounded-xl text-[11px] font-bold tracking-tight transition-all border ${
                                   selected 
                                   ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                                   : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                                 }`}
                               >
                                 Phase {sem}
                               </button>
                             );
                           })}
                        </div>
                     </div>

                     {editingId && (
                       <button 
                         onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                         className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all"
                       >
                          <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${form.isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-300'}`}>
                                {form.isActive && <Check size={16} />}
                             </div>
                             <div className="text-left">
                                <p className="text-[11px] font-bold text-slate-900">Authentication Presence</p>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{form.isActive ? 'Session Active' : 'Session Revoked'}</p>
                             </div>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${form.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>{form.isActive ? 'Authorized' : 'Locked'}</span>
                       </button>
                     )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-100">
                     <button 
                       onClick={() => setShowModal(false)}
                       className="h-14 flex-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                     >
                        Abort
                     </button>
                     <button 
                       onClick={handleSave}
                       disabled={saving}
                       className="premium-button h-14 flex-[2] rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-100"
                     >
                        {saving ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                        <span className="uppercase tracking-widest font-bold text-[11px]">{saving ? 'Synchronizing matrix...' : editingId ? 'Update Record' : 'Establish Node'}</span>
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
