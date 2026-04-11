import { useState, useEffect, useRef } from 'react';
import { userAPI, departmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Selecto from 'react-selecto';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  Plus, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Activity, 
  Key, 
  Mail, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  BookOpen,
  ArrowRight,
  Fingerprint,
  RotateCcw,
  Cpu,
  Database,
  Layout,
  AlertTriangle,
  Layers,
  Shield,
  ArrowUpRight,
  Zap,
  ChevronRight
} from 'lucide-react';

const ROLES = ['manager', 'staff', 'student'];

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

function UserModal({ user, departments, onClose, onSave }) {
  const [form, setForm] = useState(
    user
      ? { ...user, subjects: (user.subjects || []).map(s => typeof s === 'string' ? { subjectId: s } : { subjectId: s.subjectId }) }
      : { name: '', email: '', password: '', role: 'staff', department: '', category: 'B', subjects: [] }
  );
  const [subjectInput, setSubjectInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user && !form.department && departments.length > 0) {
      setForm((f) => ({ ...f, department: departments[0].name }));
    }
  }, [departments, user, form.department]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const addSubject = () => {
    const s = subjectInput.trim();
    if (!s) return;
    const alreadyExists = form.subjects.some((x) => x.subjectId === s);
    if (!alreadyExists) {
      setForm((f) => ({ ...f, subjects: [...f.subjects, { subjectId: s }] }));
    }
    setSubjectInput('');
  };

  const removeSubject = (subjectId) =>
    setForm((f) => ({ ...f, subjects: f.subjects.filter((x) => x.subjectId !== subjectId) }));

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user) {
        await userAPI.update(user._id, form);
        toast.success('Identity record synchronized');
      } else {
        await userAPI.create(form);
        toast.success('New operator successfully established');
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
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
      >
        <div className="p-10 lg:p-12 overflow-y-auto no-scrollbar space-y-10">
           <div className="flex items-center justify-between border-b border-slate-100 pb-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Fingerprint size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                       {user ? 'Edit Identity' : 'Onboard Node'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       Institutional Access Registry
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Operator Designation</label>
                    <input className="saas-input h-14 bg-slate-50 border-slate-200 focus:bg-white" placeholder="e.g. Dr. John Smith" value={form.name} onChange={set('name')} />
                 </div>
                 <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Official Identifier (Email)</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input className="saas-input h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white" type="email" placeholder="user@institution.edu" value={form.email} onChange={set('email')} />
                    </div>
                 </div>
              </div>

              {!user && (
                <div className="space-y-2.5">
                   <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Initial Security Key</label>
                   <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input className="saas-input h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} />
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Authority Scope</label>
                    <select className="saas-input h-14 bg-slate-50 border-slate-200 focus:bg-white appearance-none cursor-pointer px-4" value={form.role} onChange={set('role')}>
                       {ROLES.map((r) => <option key={r} value={r}>{r.toUpperCase()} MODULE</option>)}
                    </select>
                 </div>
                 <div className="md:col-span-2 space-y-2.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Department Cluster Link</label>
                    <select className="saas-input h-14 bg-slate-50 border-slate-200 focus:bg-white appearance-none cursor-pointer px-4" value={form.department} onChange={set('department')}>
                       <option value="">Bind to Registry Segment...</option>
                       {departments.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                 </div>
              </div>

              {form.role === 'staff' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <Activity className="text-indigo-600" size={20} />
                         <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-slate-900 leading-none">Cluster Priority</h4>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Administrative Class</p>
                         </div>
                      </div>
                      <select className="bg-white border border-slate-200 rounded-xl px-4 h-11 text-[11px] font-bold uppercase tracking-wider outline-none focus:border-indigo-500 transition-all text-slate-700 shadow-sm" value={form.category || 'B'} onChange={set('category')}>
                         <option value="A">Priority Class A</option>
                         <option value="B">Standard Class B</option>
                      </select>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3 ml-1">
                        <BookOpen size={16} className="text-indigo-400" />
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Pedagogical Mapping (Subjects)</label>
                      </div>
                      <div className="flex gap-4">
                         <input
                           placeholder="Enter subject identity code..."
                           value={subjectInput}
                           onChange={(e) => setSubjectInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                           className="flex-1 saas-input h-12 bg-white border-slate-200"
                         />
                         <button className="h-12 px-6 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-indigo-100/20" onClick={addSubject}>
                           Link Node
                         </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                         <AnimatePresence>
                            {form.subjects.map((s) => (
                              <motion.span 
                                key={s.subjectId} 
                                initial={{ scale: 0.8, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:border-indigo-200"
                              >
                                 <span>{s.subjectId}</span>
                                 <button onClick={() => removeSubject(s.subjectId)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <X size={14} />
                                 </button>
                              </motion.span>
                            ))}
                         </AnimatePresence>
                         {form.subjects.length === 0 && (
                           <p className="text-[10px] font-semibold text-slate-300 uppercase italic py-2 ml-1 tracking-widest">No subject linkages established</p>
                         )}
                      </div>
                   </div>
                </motion.div>
              )}
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
              <button onClick={onClose} className="h-14 flex-1 bg-white border border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95">
                 Abort Cycle
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="premium-button h-14 flex-[1.5] rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                 {loading ? <Activity size={20} className="animate-spin" /> : (user ? 'Update Identity' : 'Establish Node')}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [departments, setDepartments] = useState([]);

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const tableContainerRef = useRef(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, depsRes] = await Promise.all([
        userAPI.getAll(filterRole ? { role: filterRole } : {}),
        departmentAPI.getAll()
      ]);
      setUsers(usersRes.data.users);
      setDepartments(depsRes.data);
    } catch (err) {
      toast.error('Identity lattice synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); setSelectedUsers([]); }, [filterRole]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Terminate user "${name}" identity registry?`)) return;
    try {
      await userAPI.delete(id);
      toast.success('Registry record purged');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purge protocol failure');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedUsers(filtered.map((u) => u._id));
    else setSelectedUsers([]);
  };

  const handleSelectUser = (id) => {
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.includes(currentUser?._id)) {
      toast.error('Authentication error: Cannot purge active session self-registry.');
      return;
    }
    const count = selectedUsers.length;
    if (!window.confirm(`Are you sure you want to purge ${count} user(s) from the institutional directory?`)) return;
    setBulkDeleting(true);
    try {
      const { data } = await userAPI.bulkDelete(selectedUsers);
      toast.success(data.message);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk purge failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const allSelected = filtered.length > 0 && filtered.every((u) => selectedUsers.includes(u._id));

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Personnel Lattice...</p>
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
                USER <span className="text-indigo-600 font-medium">BASE</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
             Manage institutional access, operator permissions, and identity nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {isAdmin && selectedUsers.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
               <button onClick={handleBulkDelete} disabled={bulkDeleting} className="h-12 px-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-md shadow-rose-100">
                  {bulkDeleting ? 'Executing...' : `Purge ${selectedUsers.length} Nodes`}
               </button>
            </motion.div>
          )}
          <button 
            onClick={() => setModal('create')}
            className="premium-button h-12 px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <UserPlus size={18} /> Establish Identity
          </button>
        </div>
      </div>

      {/* Directory Hub */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="relative group w-full md:w-[320px]">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                 <input 
                   className="saas-input h-11 h-12 bg-white border-slate-200" 
                   placeholder="Search access registry..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <select className="saas-input h-12 bg-white border-slate-200 appearance-none cursor-pointer px-5 min-w-[200px] text-[11px] font-bold uppercase tracking-wider" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                 <option value="">Full Authority Scope</option>
                 {ROLES.map((r) => <option key={r} value={r}>{r.toUpperCase()} CATEGORY</option>)}
              </select>
           </div>
           
           <AnimatePresence>
             {selectedUsers.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3.5 shadow-sm"
               >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">{selectedUsers.length} Identifiers Logged</span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="overflow-x-auto selecto-area no-scrollbar" ref={tableContainerRef}>
          {filtered.length === 0 ? (
            <div className="py-40 flex flex-col items-center justify-center space-y-6">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                  <Database size={32} />
               </div>
               <div className="text-center space-y-1">
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Null Registry Trace</p>
                 <p className="text-xs font-semibold text-slate-300 uppercase">No identity fragments found matching query</p>
               </div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {isAdmin && (
                    <th className="p-8 text-center w-24 border-b border-slate-100">
                      <div className="flex justify-center">
                        <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="w-5 h-5 accent-indigo-600 cursor-pointer border-slate-200 bg-white rounded" />
                      </div>
                    </th>
                  )}
                  <th className="px-8 py-6 text-left border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity Node</th>
                  <th className="px-8 py-6 text-left border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Vector</th>
                  <th className="px-8 py-6 text-left border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auth Scope</th>
                  <th className="px-8 py-6 text-left border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-left border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Registry Operations</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {filtered.map((u) => (
                  <motion.tr 
                    key={u._id} 
                    variants={itemVariants}
                    data-id={u._id}
                    className={`selectable-user group transition-all duration-300 border-b border-slate-100 last:border-0 ${selectedUsers.includes(u._id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50/30'}`}
                  >
                    {isAdmin && (
                      <td className="p-8 text-center">
                        <div className="flex justify-center">
                          <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={() => handleSelectUser(u._id)} className="w-5 h-5 accent-indigo-600 cursor-pointer border-slate-200 bg-white rounded" />
                        </div>
                      </td>
                    )}
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${u.role === 'admin' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                            {u.name.charAt(0)}
                         </div>
                         <div className="space-y-1">
                            <p className="text-base font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase truncate max-w-[160px]">{u.name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <Building2 size={11} className="text-slate-200" /> {u.department || 'GLOBAL INFRASTRUCTURE'}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400">
                        <Mail size={13} className="text-slate-200" />
                        {u.email}
                      </div>
                    </td>
                    <td className="p-8">
                       <div className="flex items-center gap-3">
                          <span className={`px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm shadow-indigo-100' : 
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                             {u.role}
                          </span>
                       </div>
                    </td>
                    <td className="p-8">
                       <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border w-fit ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{u.isActive ? 'Active' : 'Locked'}</span>
                       </div>
                    </td>
                    <td className="p-8 text-right">
                       <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0">
                          <button onClick={() => setModal(u)} className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-indigo-100 transition-all active:scale-90 shadow-sm">
                             <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(u._id, u.name)} className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm">
                             <Trash2 size={15} />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </div>
      </motion.div>

      {isAdmin && !loading && filtered.length > 0 && (
        <Selecto
          container={tableContainerRef.current}
          dragContainer={tableContainerRef.current}
          selectableTargets={['.selectable-user']}
          hitRate={0}
          selectByClick={false}
          selectFromInside={false}
          toggleContinueSelect={'shift'}
          ratio={0}
          onSelect={(e) => {
            setSelectedUsers((prev) => {
              const next = new Set(prev);
              e.added.forEach((el) => {
                const id = el.getAttribute('data-id');
                if (id) next.add(id);
              });
              e.removed.forEach((el) => {
                const id = el.getAttribute('data-id');
                if (id) next.delete(id);
              });
              return Array.from(next);
            });
          }}
        />
      )}

      {/* Bulk Status Footer */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80]"
          >
             <div className="bg-white/90 backdrop-blur-3xl px-10 py-5 rounded-[2.5rem] border border-indigo-100 shadow-[0_20px_50px_rgba(79,70,229,0.15)] flex items-center gap-10">
                <div className="flex items-center gap-5 border-r border-slate-100 pr-10">
                   <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 animate-in zoom-in duration-300">
                      <Database size={20} />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-bold text-slate-900 leading-none">Cluster Operations</h4>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">{selectedUsers.length} Identity Nodes Target</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <button onClick={() => setSelectedUsers([])} className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Abort</button>
                   <button 
                     onClick={handleBulkDelete}
                     disabled={bulkDeleting}
                     className="h-11 px-6 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white active:scale-95 transition-all flex items-center gap-2.5 shadow-sm"
                   >
                      {bulkDeleting ? <Activity className="animate-spin" size={14} /> : <Trash2 size={14} />}
                      {bulkDeleting ? 'Executing' : 'Purge Registry'}
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <UserModal
            user={modal === 'create' ? null : modal}
            departments={departments}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchUsers(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
