import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { timetableAPI, userAPI, curriculumAPI, departmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeTo12H } from '../utils/timeUtils';
import { 
  ArrowLeft, 
  Save, 
  Rocket, 
  Check, 
  X, 
  Building2, 
  BookOpen, 
  CalendarDays, 
  Layers, 
  LayoutGrid, 
  Info,
  Sparkles,
  Coffee,
  Plus,
  Monitor,
  Trash2,
  Clock,
  MoreVertical,
  Activity,
  Zap,
  ArrowUpRight,
  Fingerprint,
  Cpu,
  ShieldCheck,
  Globe,
  UserCheck,
  MapPin,
  ChevronRight,
  Shield
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const defaultPeriods = [
  { period: 1, startTime: '09:15', endTime: '10:05' },
  { period: 2, startTime: '10:05', endTime: '10:55' },
  { period: 3, startTime: '11:10', endTime: '12:00' },
  { period: 4, startTime: '12:00', endTime: '12:50' },
  { period: 5, startTime: '13:45', endTime: '14:35' },
  { period: 6, startTime: '14:35', endTime: '15:25' },
  { period: 7, startTime: '15:40', endTime: '16:30' },
];

const makeSchedule = () =>
  DAYS.map((day) => ({
    day,
    slots: defaultPeriods.map((p) => ({
      ...p, subject: '', staffId: '', staffName: '', classroom: '', type: 'theory',
    })),
  }));

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

// ─── CREATE MODE ────────────────────────────────────────────────────────────
function CreateTimetableForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [semType, setSemType] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    Promise.all([
      curriculumAPI.getAll(),
      departmentAPI.getAll().catch(() => ({ data: [] }))
    ])
    .then(([currRes, deptRes]) => {
      setDepartments(deptRes.data || []);
    })
    .catch(() => {})
    .finally(() => setFetchingData(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedDept) { toast.error('Department target required.'); return; }
    if (!semType) { toast.error('Cycle target required.'); return; }
    
    setLoading(true);
    const cycleName = semType === 'odd' ? 'Odd Cycle' : 'Even Cycle';
    const toastId = toast.loading(`Initializing ${cycleName} generation protocols for ${selectedDept}...`);
    try {
      const payload = {
        title: title.trim(),
        department: selectedDept,
        semesterType: semType
      };
      const { data } = await curriculumAPI.generate(payload);
      toast.success(data.message, { id: toastId, duration: 6000 });
      navigate('/timetables');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation engine failure.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Engine Modules...</p>
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto space-y-12 py-10"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div variants={itemVariants} className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-2">
          <Rocket size={32} />
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none uppercase">Generation <span className="text-indigo-600 font-medium lowercase">Engine</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">Automated Institutional Scheduling</p>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white p-10 lg:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Instance Identity</label>
            <div className="relative">
              <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                className="saas-input h-14 pl-12 pr-6 bg-slate-50 border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white shadow-inner" 
                placeholder="e.g. AD&DS 2025-2026 ARCHITECTURE" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Target Department</label>
              <div className="relative">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  value={selectedDept} 
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="saas-input pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl appearance-none cursor-pointer font-bold text-[11px] uppercase tracking-widest text-slate-700 focus:bg-white shadow-inner"
                >
                  <option value="">Identify Node...</option>
                  {departments.map(d => <option key={d._id} value={d.name}>{d.name.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Operational Cycle</label>
              <div className="relative">
                <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  value={semType} 
                  onChange={(e) => setSemType(e.target.value)}
                  className="saas-input pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl appearance-none cursor-pointer font-bold text-[11px] uppercase tracking-widest text-slate-700 focus:bg-white shadow-inner"
                >
                  <option value="">Select Phase...</option>
                  <option value="odd">Odd Cycle (1, 3, 5, 7)</option>
                  <option value="even">Even Cycle (2, 4, 6, 8)</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !selectedDept || !semType}
            className="premium-button w-full h-18 rounded-2xl text-[11px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
          >
            {loading ? <Activity size={20} className="animate-spin" /> : <Zap size={20} />}
            {loading ? 'Initializing protocols...' : 'Activate generation'}
          </button>
      </motion.div>

      <div className="flex justify-center">
        <button 
          onClick={() => navigate('/timetables')}
          className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all active:scale-95"
        >
          <ArrowLeft size={16} /> Abort and return
        </button>
      </div>
    </motion.div>
  );
}

// ─── EDIT MODE ──────────────────────────────────────────────────────────────
function EditTimetableForm({ id }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meta, setMeta] = useState({ title: '', department: '', semester: '', section: '', academicYear: '' });
  const [schedule, setSchedule] = useState(makeSchedule());
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingCell, setEditingCell] = useState(null);

  useEffect(() => { userAPI.getStaff().then(({ data }) => setStaff(data.staff)).catch(() => {}); }, []);

  useEffect(() => {
    timetableAPI.getById(id)
      .then(({ data }) => {
        const tt = data.timetable;
        setMeta({ title: tt.title, department: tt.department, semester: tt.semester, section: tt.section, academicYear: tt.academicYear });
        setSchedule(tt.schedule.length > 0 ? tt.schedule : makeSchedule());
      })
      .catch(() => toast.error('Work-state retrieval failed'))
      .finally(() => setFetching(false));
  }, [id]);

  const updateSlot = (dayIdx, slotIdx, field, value) => {
    setSchedule((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[dayIdx].slots[slotIdx][field] = value;
      if (field === 'staffId') {
        const member = staff.find((s) => s._id === value);
        next[dayIdx].slots[slotIdx].staffName = member ? member.name : '';
      }
      return next;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...meta, semester: Number(meta.semester), schedule };
      await timetableAPI.update(id, payload);
      toast.success('Institutional synchronicity maintained');
      navigate(`/timetables/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synchronization failure');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Decoding Workspace State...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-1 h-8 bg-indigo-600 rounded-full" />
             <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-1 leading-none italic">
                  <Activity size={14} className="animate-pulse" />
                  Override active
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none uppercase max-w-2xl overflow-hidden text-ellipsis whitespace-nowrap">
                   {meta.title}
                </h1>
             </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-2 sm:ml-5">
             <div className="px-4 py-1.5 bg-white text-slate-500 rounded-xl flex items-center gap-2 border border-slate-200 shadow-sm">
                <Building2 size={13} className="text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{meta.department}</span>
             </div>
             <div className="px-4 py-1.5 bg-white text-slate-500 rounded-xl flex items-center gap-2 border border-slate-200 shadow-sm">
                <BookOpen size={13} className="text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Phase {meta.semester}</span>
             </div>
             <div className="px-4 py-1.5 bg-white text-slate-500 rounded-xl flex items-center gap-2 border border-slate-200 shadow-sm">
                <Monitor size={13} className="text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Section {meta.section}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button 
            onClick={() => navigate(-1)}
            className="h-12 px-6 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all active:scale-95 w-full lg:w-auto shadow-sm"
          >
            Abort
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="premium-button h-12 px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all w-full lg:w-auto flex items-center justify-center gap-2"
          >
            {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Commiting...' : 'Save Workspace'}
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
           <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase leading-none">Spatial Matrix</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Time Mapping</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                 <div className="w-3 h-3 bg-indigo-50 border border-indigo-200 rounded" />
                 THEORY
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                 <div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded" />
                 LAB
              </div>
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-left w-[120px] sticky left-0 z-30 bg-slate-50 border-r border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</span>
                </th>
                {schedule[0]?.slots.map((slot) => (
                  <th key={slot.period} className="p-6 text-center min-w-[200px] border-b border-slate-100">
                    <div className="space-y-1.5">
                       <span className="text-[11px] font-bold text-slate-900 uppercase">Cycle {slot.period}</span>
                       <div className="text-[10px] font-bold text-slate-400 tracking-tight flex items-center justify-center gap-1.5">
                          <Clock size={12} className="text-indigo-400" />
                          {formatTimeTo12H(slot.startTime)} – {formatTimeTo12H(slot.endTime)}
                       </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((day, dayIdx) => (
                <tr key={day.day} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                  <td className="p-6 sticky left-0 z-20 bg-white border-r border-slate-100 font-bold text-slate-900 text-sm uppercase">
                    {day.day}
                  </td>
                  {day.slots.map((slot, slotIdx) => {
                    const isEditing = editingCell?.dayIdx === dayIdx && editingCell?.slotIdx === slotIdx;
                    return (
                      <td key={slotIdx} className="p-3 relative">
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div 
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              className="w-[260px] bg-white border border-indigo-200 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] absolute z-40 space-y-5 left-1/2 -translate-x-1/2 -top-10"
                            >
                               <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Mapping Type</label>
                                  <select 
                                    value={slot.type} 
                                    onChange={(e) => updateSlot(dayIdx, slotIdx, 'type', e.target.value)}
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[11px] font-bold uppercase text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                  >
                                     <option value="theory">THEORY NODE</option>
                                     <option value="lab">LABORATORY NODE</option>
                                     <option value="break">INTERMISSION</option>
                                     <option value="free">VACANT CELL</option>
                                  </select>
                               </div>

                               {slot.type !== 'break' && slot.type !== 'free' && (
                                 <div className="space-y-4">
                                   <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Course</label>
                                      <input 
                                        placeholder="Course name..." 
                                        value={slot.subject}
                                        onChange={(e) => updateSlot(dayIdx, slotIdx, 'subject', e.target.value)}
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-500 transition-all shadow-inner" 
                                      />
                                   </div>
                                   <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Personnel</label>
                                      <select 
                                        value={slot.staffId} 
                                        onChange={(e) => updateSlot(dayIdx, slotIdx, 'staffId', e.target.value)}
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[11px] font-bold uppercase text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                      >
                                        <option value="">Sync Staff...</option>
                                        {staff.map((s) => <option key={s._id} value={s._id}>{s.name.toUpperCase()}</option>)}
                                      </select>
                                   </div>
                                   <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Location</label>
                                      <input 
                                        placeholder="Room ID..." 
                                        value={slot.classroom}
                                        onChange={(e) => updateSlot(dayIdx, slotIdx, 'classroom', e.target.value)}
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-500 transition-all shadow-inner" 
                                      />
                                   </div>
                                 </div>
                               )}

                               <button 
                                 onClick={() => setEditingCell(null)}
                                 className="premium-button w-full h-12 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100"
                               >
                                 <Check size={18} /> Commit cell
                               </button>
                            </motion.div>
                          ) : (
                            <div 
                              onClick={() => setEditingCell({ dayIdx, slotIdx })}
                              className={`h-28 rounded-3xl border-2 transition-all duration-300 cursor-pointer p-4 flex flex-col justify-between group ${
                                slot.type === 'break' ? 'bg-slate-50 border-slate-100 opacity-60' :
                                slot.type === 'free' || !slot.subject ? 'bg-transparent border-dashed border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30' :
                                slot.type === 'lab' ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:shadow-lg' :
                                'bg-indigo-50 border-indigo-100 hover:border-indigo-300 hover:shadow-lg'
                              }`}
                            >
                               {slot.type === 'break' ? (
                                 <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
                                    <Coffee size={20} />
                                    <span className="text-[9px] font-bold uppercase">Break</span>
                                 </div>
                               ) : slot.type === 'free' || !slot.subject ? (
                                 <div className="flex flex-col items-center justify-center h-full gap-1.5 text-slate-300 group-hover:text-indigo-400">
                                    <Plus size={16} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Unassigned</span>
                                 </div>
                               ) : (
                                 <>
                                   <div className="space-y-1.5 overflow-hidden">
                                      <div className="flex items-center gap-2">
                                         <div className={`w-1.5 h-1.5 rounded-full ${slot.type === 'lab' ? 'bg-emerald-500' : 'bg-indigo-600'}`} />
                                         <span className={`text-[9px] font-bold uppercase tracking-widest ${slot.type === 'lab' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                           {slot.type}
                                         </span>
                                      </div>
                                      <h5 className="text-[12px] font-bold text-slate-900 leading-tight uppercase truncate">
                                        {slot.subject}
                                      </h5>
                                   </div>
                                   <div className="pt-2 border-t border-slate-100/50">
                                      <div className="flex items-center gap-2">
                                         <UserCheck size={12} className="text-slate-300 shrink-0" />
                                         <span className="text-[10px] font-bold text-slate-500 truncate uppercase">
                                           {slot.staffName || 'Pnd.'}
                                         </span>
                                      </div>
                                      {slot.classroom && (
                                        <div className="flex items-center gap-2 mt-1">
                                           <MapPin size={10} className="text-slate-300 shrink-0" />
                                           <span className="text-[9px] font-bold text-slate-300 uppercase truncate">
                                             {slot.classroom}
                                           </span>
                                        </div>
                                      )}
                                   </div>
                                 </>
                               )}
                            </div>
                          )}
                        </AnimatePresence>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
               <Cpu size={28} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grid Status</p>
               <h4 className="text-lg font-bold text-slate-900 uppercase">Synchronized</h4>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner">
               <CalendarDays size={28} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Load Balance</p>
               <h4 className="text-lg font-bold text-slate-900 uppercase">{schedule.reduce((acc, day) => acc + day.slots.filter(s => s.subject).length, 0)} Active Nodes</h4>
            </div>
         </div>
         <div className="bg-indigo-600 p-8 rounded-[2.5rem] border border-indigo-500 shadow-xl shadow-indigo-100 flex items-center gap-6 group cursor-pointer hover:bg-indigo-700 transition-all">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg">
               <Globe size={28} className="animate-pulse" />
            </div>
            <div className="text-white">
               <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Institutional Sync</p>
               <h4 className="text-lg font-bold uppercase flex items-center gap-2">
                 Override <ArrowUpRight size={18} />
               </h4>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function TimetableEditorPage() {
  const { id } = useParams();
  return (
    <AnimatePresence mode="wait">
      {id ? (
        <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <EditTimetableForm id={id} />
        </motion.div>
      ) : (
        <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <CreateTimetableForm />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
