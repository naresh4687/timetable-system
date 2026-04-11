import React, { useState, useEffect } from 'react';
import { constraintAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  ShieldBan, 
  Calendar, 
  Clock, 
  UserCheck, 
  Activity, 
  History, 
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  LayoutGrid,
  Lock,
  Cpu,
  Fingerprint,
  RotateCcw,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

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

export default function ConstraintsPage() {
  const [constraints, setConstraints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    staffId: '',
    academicYear: '2025-2026',
    semester: 1,
    avoidDays: [],
    avoidPeriods: [],
    avoidSlots: [],
    maxHours: 17
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [constRes, staffRes] = await Promise.all([
        constraintAPI.getAll(),
        userAPI.getStaff()
      ]);
      setConstraints(constRes.data.constraints);
      setStaffList(staffRes.data.staff);
    } catch (error) {
      toast.error('Identity lattice synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      academicYear: '2025-2026',
      semester: 1,
      avoidDays: [],
      avoidPeriods: [],
      avoidSlots: [],
      maxHours: 17
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (c) => {
    setFormData({
      staffId: c.staffId?._id || '',
      academicYear: c.academicYear,
      semester: c.semester,
      avoidDays: c.avoidDays || [],
      avoidPeriods: c.avoidPeriods || [],
      avoidSlots: c.avoidSlots || [],
      maxHours: c.maxHours || 17
    });
    setEditingId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate institutional policy constraint?')) return;
    try {
      await constraintAPI.delete(id);
      toast.success('Policy purged from matrix');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purge protocol failure');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId) return toast.error('Operator identifier required');
    
    try {
      if (editingId) {
        await constraintAPI.update(editingId, formData);
        toast.success('Access policy recalibrated');
      } else {
        await constraintAPI.create(formData);
        toast.success('New access policy established');
      }
      fetchData();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction registry failure');
    }
  };

  const toggleArrayItem = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const toggleSlot = (day, period) => {
    setFormData(prev => {
      const exists = prev.avoidSlots.find(s => s.day === day && s.period === period);
      if (exists) {
        return { ...prev, avoidSlots: prev.avoidSlots.filter(s => !(s.day === day && s.period === period)) };
      } else {
        return { ...prev, avoidSlots: [...prev.avoidSlots, { day, period }] };
      }
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Policy Lattice...</p>
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
                Constraint <span className="text-indigo-600 font-medium">Lattice</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
             Define institutional access policies, staff availability, and workload limits.
          </p>
        </div>

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="premium-button h-12 px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all w-full lg:w-auto"
          >
            <Plus size={18} /> Establish Policy
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
             <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 mb-12">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                         <ShieldCheck size={28} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Policy Terminal</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lattice Configuration</p>
                      </div>
                   </div>
                   <button 
                     onClick={resetForm} 
                     className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100 shadow-sm"
                   >
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Target Personnel</label>
                         <div className="relative">
                            <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                              className="saas-input h-12 pl-12 pr-6 bg-slate-50 border-slate-200 rounded-xl appearance-none cursor-pointer font-bold text-[11px] tracking-widest uppercase text-slate-700 focus:bg-white transition-all shadow-inner"
                              value={formData.staffId} 
                              onChange={e => setFormData({...formData, staffId: e.target.value})}
                              disabled={!!editingId}
                              required
                            >
                               <option value="">Identify Operator...</option>
                               {staffList.map(s => (
                                 <option key={s._id} value={s._id}>{s.name.toUpperCase()} – {s.department}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Cycle</label>
                         <input className="saas-input h-12 bg-slate-50 border-slate-200 rounded-xl px-5 font-bold text-[11px] uppercase tracking-widest shadow-inner focus:bg-white" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} required placeholder="2025-2026" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Load Limit</label>
                         <div className="relative">
                            <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input type="number" className="saas-input h-12 pl-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-[11px] shadow-inner focus:bg-white" value={formData.maxHours} onChange={e => setFormData({...formData, maxHours: parseInt(e.target.value)})} min="1" max="40" />
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Day Exclusions</label>
                            <div className="grid grid-cols-1 gap-2">
                               {DAYS.map(day => {
                                 const selected = formData.avoidDays.includes(day);
                                 return (
                                   <button
                                     key={day} type="button" onClick={() => toggleArrayItem('avoidDays', day)}
                                     className={`h-11 flex items-center justify-between px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                       selected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                                     }`}
                                   >
                                     {day}
                                     {selected ? <Minimize2 size={13} /> : <Maximize2 size={13} className="opacity-20" />}
                                   </button>
                                 );
                               })}
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Period Exclusions</label>
                            <div className="grid grid-cols-4 gap-2">
                               {PERIODS.map(p => {
                                 const selected = formData.avoidPeriods.includes(p);
                                 return (
                                   <button
                                     key={p} type="button" onClick={() => toggleArrayItem('avoidPeriods', p)}
                                     className={`h-11 flex items-center justify-center rounded-xl text-[10px] font-bold uppercase transition-all border ${
                                       selected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300'
                                     }`}
                                   >
                                     P{p}
                                   </button>
                                 );
                               })}
                            </div>
                         </div>
                      </div>

                      <div className="lg:col-span-2 space-y-4">
                         <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Precision Exclusion Matrix</label>
                            <div className="flex items-center gap-2">
                               <ShieldBan size={14} className="text-slate-300" />
                               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Toggle prohibited slots</span>
                            </div>
                         </div>
                         <div className="bg-slate-50 p-6 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
                            <table className="w-full border-separate border-spacing-2">
                               <thead>
                                  <tr>
                                     <th className="w-12"></th>
                                     {DAYS.map(d => <th key={d} className="text-[9px] font-bold uppercase text-slate-300 tracking-widest pb-3 px-2">{d.slice(0, 3)}</th>)}
                                  </tr>
                               </thead>
                               <tbody>
                                  {PERIODS.map(p => (
                                    <tr key={p}>
                                       <td className="text-center text-[10px] font-bold text-slate-300 pr-3">P{p}</td>
                                       {DAYS.map(d => {
                                          const isActive = formData.avoidSlots.some(s => s.day === d && s.period === p);
                                          const isDayAvoided = formData.avoidDays.includes(d);
                                          const isPeriodAvoided = formData.avoidPeriods.includes(p);
                                          const disabled = isDayAvoided || isPeriodAvoided;
                                          return (
                                            <td key={d}>
                                               <button
                                                 type="button"
                                                 disabled={disabled}
                                                 onClick={() => toggleSlot(d, p)}
                                                 className={`w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center group/cell ${
                                                   disabled ? 'bg-slate-200/50 border-transparent cursor-not-allowed' :
                                                   isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100 scale-90' : 'bg-white border-slate-100 border-dashed hover:border-indigo-300'
                                                 }`}
                                               >
                                                  {isActive && <ShieldBan size={18} />}
                                                  {!isActive && !disabled && <div className="w-1 h-1 rounded-full bg-slate-300 group-hover/cell:scale-150 transition-all duration-300" />}
                                               </button>
                                            </td>
                                          );
                                       })}
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button type="button" onClick={resetForm} className="h-14 flex-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                         Discard Modifications
                      </button>
                      <button type="submit" className="premium-button h-14 flex-[2] rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2">
                         <Save size={18} /> {editingId ? 'Recalibrate Lattice' : 'Synchronize Policy'}
                      </button>
                   </div>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constraints Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {constraints.length === 0 ? (
          <div className="col-span-full py-40 flex flex-col items-center gap-6 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white shadow-inner">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
                <ShieldBan size={36} />
             </div>
             <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Null Registry Response</p>
          </div>
        ) : (
          constraints.map((c) => (
            <motion.div 
              key={c._id} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100 flex flex-col justify-between"
            >
               <div className="space-y-8 relative z-10">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 border border-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100 transition-all duration-300 group-hover:scale-105">
                           {c.staffId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase leading-none group-hover:text-indigo-600 transition-colors">{c.staffId?.name || 'Unknown Operator'}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{c.staffId?.department || 'GENERAL ACCESS'}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)} className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-indigo-600 transition-all active:scale-90 shadow-sm">
                           <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm">
                           <Trash2 size={15} />
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner group/stat relative overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Intensity</p>
                        <div className="flex items-end gap-1.5">
                           <span className="text-2xl font-bold text-slate-900 leading-none">{c.maxHours}</span>
                           <span className="text-[10px] font-bold text-slate-300 uppercase leading-none mb-0.5">Units</span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full mt-4 overflow-hidden shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(c.maxHours/40)*100}%` }}
                             className="h-full bg-indigo-600 shadow-lg shadow-indigo-500/50" 
                           />
                        </div>
                     </div>
                     <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner flex flex-col justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lifecycle</p>
                        <p className="text-[11px] font-bold text-slate-700 tracking-tight uppercase leading-none mt-2">Phase {c.semester}</p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">{c.academicYear}</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                           <Activity size={14} className="text-indigo-600" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Directives</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {c.avoidDays?.length > 0 && (
                             <div className="px-3 py-1.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <Minimize2 size={12} />
                                {c.avoidDays.length} Days
                             </div>
                           )}
                           {c.avoidPeriods?.length > 0 && (
                             <div className="px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <Lock size={12} />
                                {c.avoidPeriods.length} Global
                             </div>
                           )}
                           {c.avoidSlots?.length > 0 && (
                             <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} />
                                {c.avoidSlots.length} Slots
                             </div>
                           )}
                           {!c.avoidDays?.length && !c.avoidPeriods?.length && !c.avoidSlots?.length && (
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic py-1">Universal Access Verified</span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <History size={12} className="text-slate-200" />
                     <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest leading-none">In Matrix</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
               </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
