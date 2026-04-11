import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, timetableAPI, expectationAPI, departmentAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  UserPlus,
  Plus,
  FileText,
  Eye,
  Shield,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  Database,
  Layers,
  ChevronRight,
  Layout
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

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, timetables: 0, expectations: 0, staff: 0, departments: 0 });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const promises = [];
        if (user.role === 'admin' || user.role === 'manager') {
          promises.push(
            userAPI.getAll().then(({ data }) => data.users.length),
            timetableAPI.getAll().then(({ data }) => data.timetables.length),
            expectationAPI.getAll().then(({ data }) => data.expectations.length),
            userAPI.getStaffCount().then(({ data }) => data.count),
            timetableAPI.getAll().then(({ data }) => {
              const feedbacks = data.timetables
                .filter((t) => t.status === 'approved' || t.status === 'rejected')
                .slice(0, 5);
              setRecentFeedback(feedbacks);
              return data.timetables.length;
            }),
            departmentAPI.getAll().then(({ data }) => data.length)
          );
          const [users, timetablesToIgnore, expectations, staff, timetables, departments] = await Promise.all(promises);
          setStats({ users, timetables, expectations, staff, departments });
        } else {
          const { data } = await timetableAPI.getAll();
          setStats((s) => ({ ...s, timetables: data.timetables.length }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.role]);

  const adminStats = [
    { label: 'Total Personnel', value: stats.users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/users' },
    { label: 'Registry Units', value: stats.departments, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/departments' },
    { label: 'Active Schedules', value: stats.timetables, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50', to: '/timetables' },
    { label: 'Input Reqs', value: stats.expectations, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50', to: '/expectations' },
  ];

  const quickActions = {
    admin: [
      { label: 'Provision Node', icon: UserPlus, to: '/users', desc: 'Initialize new institutional identities', color: 'text-indigo-600' },
      { label: 'Architect Units', icon: Building2, to: '/departments', desc: 'Configure registry nodes', color: 'text-emerald-600' },
      { label: 'Trigger Engine', icon: Cpu, to: '/timetables/new', desc: 'Execute automated allocation cycle', color: 'text-blue-600' },
      { label: 'Audit Assets', icon: Layers, to: '/expectations', desc: 'Review personnel requirements', color: 'text-amber-600' },
    ],
    manager: [
      { label: 'Review Ledger', icon: CalendarDays, to: '/timetables', desc: 'Authorize or reject schedule drafts', color: 'text-indigo-600' },
      { label: 'Personnel Grid', icon: GraduationCap, to: '/staff', desc: 'Analyze instructor distribution', color: 'text-emerald-600' },
    ],
    staff: [
      { label: 'Submit Signal', icon: FileText, to: '/preferences', desc: 'Log individual subject requirements', color: 'text-blue-600' },
      { label: 'Personal Schedule', icon: CalendarDays, to: '/timetables', desc: 'View synchronized personal schedule', color: 'text-amber-600' },
    ],
    student: [
      { label: 'Master View', icon: CalendarDays, to: '/timetables', desc: 'Access global academic timetable', color: 'text-indigo-600' },
    ],
  };

  const actions = quickActions[user.role] || [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Infrastructure Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
             <div className="w-1 h-8 bg-indigo-600 rounded-full" />
             <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
               Admin <span className="text-indigo-600 font-medium">Dashboard</span>
             </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm ml-4">Global Infrastructure Management Interface & Monitoring Hub</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Temporal Origin</p>
            <p className="text-sm font-semibold text-slate-900">{new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm pr-6">
             <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
               {user.name.charAt(0)}
             </div>
             <div className="space-y-0.5">
               <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest leading-none"></p>
               <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Matrix */}
      {(user.role === 'admin' || user.role === 'manager') && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {adminStats.map((s) => (
            <motion.div 
              key={s.label}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              onClick={() => navigate(s.to)}
              className="premium-card p-8 flex flex-col justify-between cursor-pointer group hover:border-indigo-200 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl ${s.bg} border border-slate-100 flex items-center justify-center ${s.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <s.icon size={26} />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                  Analyze <ChevronRight size={12} />
                </div>
              </div>
              <div className="mt-10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{s.label}</p>
                <h4 className="text-4xl font-bold text-slate-900 tracking-tight">{s.value}</h4>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Main Grid: Operational Portal & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">System Protocols</h2>
                <div className="h-px flex-1 bg-slate-100 mx-6" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Runtime</span>
             </div>

             <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className="grid grid-cols-1 sm:grid-cols-2 gap-4"
             >
               {actions.map((a) => (
                 <motion.button 
                   key={a.label}
                   variants={itemVariants}
                   whileHover={{ scale: 1.01 }}
                   whileTap={{ scale: 0.99 }}
                   onClick={() => navigate(a.to)}
                   className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left flex items-start gap-5 group"
                 >
                   <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${a.color} group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                      <a.icon size={20} />
                   </div>
                   <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{a.label}</h4>
                      <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{a.desc}</p>
                   </div>
                   <ArrowRight size={16} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                 </motion.button>
               ))}
             </motion.div>
          </div>

          {(user.role === 'admin' || user.role === 'manager') && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Events</h2>
                  <div className="h-px flex-1 bg-slate-100 mx-6" />
                  <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">View Journal</button>
               </div>

               <div className="space-y-4">
                  {recentFeedback.length > 0 ? recentFeedback.map((tt, idx) => (
                    <motion.div 
                      key={tt._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${tt.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {tt.status === 'approved' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{tt.title}</h4>
                            <div className="flex items-center gap-3">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tt.department} Segment</p>
                               <div className="w-1 h-1 bg-slate-200 rounded-full" />
                               <span className={`text-[9px] font-black uppercase tracking-widest ${tt.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`}>{tt.status} Authorized</span>
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/timetables/${tt._id}`)}
                        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                      >
                         <Eye size={18} />
                      </button>
                    </motion.div>
                  )) : (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                       <Clock size={32} className="text-slate-200 mb-4" />
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Zero system events logged</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
             <h2 className="text-lg font-bold text-slate-900 tracking-tight">Systems Pulse</h2>
             
             <div className="grid grid-cols-1 gap-4">
                <div className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-8 shadow-sm group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                         <Cpu size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Compute Load</p>
                        <p className="text-2xl font-bold text-slate-900">0.8% <span className="text-[10px] text-emerald-500 font-bold ml-1 uppercase">Optimal</span></p>
                      </div>
                   </div>
                   <div className="space-y-3 pt-2">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "0.8%" }} className="h-full bg-indigo-600" />
                      </div>
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Registry Processing</span>
                        <span>Peak 64.2%</span>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-8 shadow-sm group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                         <Database size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lattice Latency</p>
                        <p className="text-2xl font-bold text-slate-900">14 <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">MS</span></p>
                      </div>
                   </div>
                   <div className="flex items-end gap-1.5 h-12 px-1 pt-2">
                      {[30, 45, 20, 70, 40, 35, 60, 32, 25, 50, 45, 30].map((h, i) => (
                        <div 
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-t-sm transition-all duration-500 ${i === 7 ? 'bg-indigo-600' : 'bg-slate-100'}`} 
                        />
                      ))}
                   </div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center italic">Global Data Sync Active</p>
                </div>
             </div>
          </div>

          <div className="p-5 bg-indigo-600 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100">
             <Activity size={16} className="text-white/50 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-white">Status: Optimal Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
