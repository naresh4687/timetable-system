import { useState, useEffect } from 'react';
import { expectationAPI, curriculumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { semToYear } from '../utils/semesterUtils';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  AlertTriangle,
  History,
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  Calendar,
  Save,
  Plus,
  FileText,
  Activity,
  Fingerprint,
  Cpu,
  ShieldCheck,
  Layout,
  Layers,
  Zap,
  RotateCcw,
  Target,
  Box,
  Compass,
  ArrowRight,
  ArrowUpRight,
  Monitor,
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

export default function PreferencesPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    preferredTheorySubjects: [], 
    preferredLabSubjects: [],   
    additionalNotes: '',
    academicYear: '2025-2026',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);
  const [curricula, setCurricula] = useState([]);
  const [expandedSems, setExpandedSems] = useState([1, 2, 3, 4, 5, 6, 7, 8]); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, curRes] = await Promise.all([
        expectationAPI.getMyExpectation(),
        curriculumAPI.getAll(),
      ]);
      
      if (expRes.data.expectation) {
        const exp = expRes.data.expectation;
        setExisting(exp);
        setForm((f) => ({
          ...f,
          preferredTheorySubjects: exp.preferredTheorySubjects || [],
          preferredLabSubjects: exp.preferredLabSubjects || [],
          additionalNotes: exp.additionalNotes || '',
          academicYear: exp.academicYear || '2025-2026',
        }));
      }
      setCurricula(curRes.data.curricula || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Initialization sequence failed. Re-mapping nodes...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [form.academicYear]);

  const toggleSemester = (sem) => {
    setExpandedSems(prev => 
      prev.includes(sem) ? prev.filter(s => s !== sem) : [...prev, sem]
    );
  };

  const isTheorySelected = (subName, sem) => {
    return form.preferredTheorySubjects.some(
      s => s.subject === subName && Number(s.semester) === Number(sem)
    );
  };

  const isLabSelected = (subName, sem) => {
    return form.preferredLabSubjects.some(
      s => s.subject === subName && Number(s.semester) === Number(sem)
    );
  };

  const getValidationState = () => {
    const sectionMap = {};
    
    form.preferredTheorySubjects.forEach(s => {
      const key = `${s.semester}-${s.section}`;
      if (!sectionMap[key]) sectionMap[key] = { theory: 0, lab: 0, sem: s.semester, sec: s.section };
      sectionMap[key].theory++;
    });
    form.preferredLabSubjects.forEach(s => {
      const key = `${s.semester}-${s.section}`;
      if (!sectionMap[key]) sectionMap[key] = { theory: 0, lab: 0, sem: s.semester, sec: s.section };
      sectionMap[key].lab++;
    });

    const sections = Object.keys(sectionMap).sort().map(key => ({
      ...sectionMap[key],
      isValid: sectionMap[key].theory >= 1 && sectionMap[key].lab >= 1 && 
               sectionMap[key].theory <= 3 && sectionMap[key].lab <= 2
    }));

    const isAllValid = sections.length > 0 && sections.every(s => s.isValid);
    return { sections, isAllValid };
  };

  const handleTheoryToggle = (subName, sem, totalSections) => {
    const isSelected = isTheorySelected(subName, sem);
    
    setForm(f => {
      if (isSelected) {
        return {
          ...f,
          preferredTheorySubjects: f.preferredTheorySubjects.filter(
            s => !(s.subject === subName && Number(s.semester) === Number(sem))
          )
        };
      } else {
        const currentSections = {};
        f.preferredTheorySubjects.forEach(s => {
          const key = `${s.semester}-${s.section}`;
          currentSections[key] = (currentSections[key] || 0) + 1;
        });

        for (let i = 0; i < totalSections; i++) {
          const sec = String.fromCharCode(65 + i);
          const key = `${sem}-${sec}`;
          if ((currentSections[key] || 0) >= 3) {
            toast.error(`Constraint Violation: Section ${sec} already at max Theory capacity.`);
            return f;
          }
        }

        const newEntries = [];
        for (let i = 0; i < totalSections; i++) {
          newEntries.push({ subject: subName, semester: Number(sem), section: String.fromCharCode(65 + i) });
        }
        return {
          ...f,
          preferredTheorySubjects: [...f.preferredTheorySubjects, ...newEntries]
        };
      }
    });
  };

  const handleLabToggle = (subName, sem, totalSections) => {
    const isSelected = isLabSelected(subName, sem);
    
    setForm(f => {
      if (isSelected) {
        return {
          ...f,
          preferredLabSubjects: f.preferredLabSubjects.filter(
            s => !(s.subject === subName && Number(s.semester) === Number(sem))
          )
        };
      } else {
        const currentSections = {};
        f.preferredLabSubjects.forEach(s => {
          const key = `${s.semester}-${s.section}`;
          currentSections[key] = (currentSections[key] || 0) + 1;
        });

        for (let i = 0; i < totalSections; i++) {
          const sec = String.fromCharCode(65 + i);
          const key = `${sem}-${sec}`;
          if ((currentSections[key] || 0) >= 2) {
            toast.error(`Constraint Violation: Section ${sec} already at max Lab capacity.`);
            return f;
          }
        }

        const newEntries = [];
        for (let i = 0; i < totalSections; i++) {
          newEntries.push({ subject: subName, semester: Number(sem), section: String.fromCharCode(65 + i) });
        }
        return {
          ...f,
          preferredLabSubjects: [...f.preferredLabSubjects, ...newEntries]
        };
      }
    });
  };

  const handleSubmit = async () => {
    const { isAllValid, sections } = getValidationState();
    
    if (sections.length === 0) {
      toast.error('Initial selection required for matrix synchronization.');
      return;
    }

    if (!isAllValid) {
      toast.error('Operational bounds unsatisfied. Each section requires 1-3 Theory and 1-2 Lab nodes.');
      return;
    }

    setSaving(true);
    try {
      await expectationAPI.submit(form);
      toast.success('Matrix synchronization complete.');
      setExisting(form);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synchronization failed.');
    } finally {
      setSaving(false);
    }
  };

  const val = getValidationState();

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Mapping Curricula Index...</p>
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
                Subject <span className="text-indigo-600 font-medium">Preferences</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
             Configure your teaching matrix. Mandatory bounds: 1-3 Theory and 1-2 Lab cycles.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="px-6 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center sm:items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-0.5 leading-none">Active Cycle</span>
            <span className="text-[11px] font-bold text-slate-700 tracking-widest uppercase">{form.academicYear}</span>
          </div>
          {existing && (
            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <ShieldCheck size={18} className="animate-pulse" />
              Synchronized
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Selection Area */}
        <div className="flex-1 space-y-10 w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {curricula.map((cur) => {
              const semSections = val.sections.filter(s => s.sem === cur.semester);
              const isSemUnbalanced = semSections.some(s => !s.isValid);
              const isExpanded = expandedSems.includes(cur.semester);

              return (
                <motion.div 
                  key={cur.semester}
                  variants={itemVariants}
                  className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-300 shadow-xl shadow-slate-200/50' : ''}`}
                >
                  <button 
                    onClick={() => toggleSemester(cur.semester)}
                    className={`w-full flex flex-col sm:flex-row items-center justify-between p-8 text-left transition-colors ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-8 mb-6 sm:mb-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all duration-300 border ${isExpanded ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                        {cur.semester}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none uppercase">{semToYear(cur.semester)} Year</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Phase {cur.semester}</p>
                           {isSemUnbalanced && (
                             <div className="flex items-center gap-2 px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-lg">
                               <AlertTriangle size={12} className="text-rose-500 animate-pulse" />
                               <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest leading-none">Unsaturated</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex -space-x-3">
                         {Array.from({ length: cur.sections || 1 }).map((_, i) => {
                           const sec = String.fromCharCode(65 + i);
                           const isValid = semSections.find(s => s.sec === sec)?.isValid;
                           return (
                             <div key={i} title={`Section ${sec}`} className={`w-10 h-10 rounded-xl border-2 border-white text-[11px] font-bold flex items-center justify-center shadow-lg transition-all duration-500 ${isValid ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                               {sec}
                             </div>
                           );
                         })}
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white transition-all duration-300 ${isExpanded ? 'rotate-180 border-indigo-500 text-indigo-600' : 'text-slate-300'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 overflow-hidden"
                      >
                        <div className="p-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                          {cur.subjects.map((sub) => {
                            const isMaxReached = cur.sections > 0 && Array.from({ length: cur.sections }).every((_, i) => {
                              const sec = String.fromCharCode(65 + i);
                              const stats = val.sections.find(vs => vs.sem === cur.semester && vs.sec === sec);
                              if (!stats) return false;
                              if (sub.type === 'theory') return stats.theory >= 3 && !isTheorySelected(sub.name, cur.semester);
                              return stats.lab >= 2 && !isLabSelected(sub.name, cur.semester);
                            });

                            const isSelected = sub.type === 'theory' 
                              ? isTheorySelected(sub.name, cur.semester)
                              : isLabSelected(sub.name, cur.semester);

                            return (
                              <motion.div 
                                key={sub._id}
                                onClick={() => !isMaxReached && (sub.type === 'theory' 
                                  ? handleTheoryToggle(sub.name, cur.semester, cur.sections || 1)
                                  : handleLabToggle(sub.name, cur.semester, cur.sections || 1)
                                )}
                                className={`group relative p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-100' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'} ${isMaxReached ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                              >
                                <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-3">
                                      <div className={`text-[9px] uppercase font-bold tracking-widest flex items-center gap-2 leading-none transition-colors ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        {sub.type === 'theory' ? <BookOpen size={14} /> : <FlaskConical size={14} />}
                                        {sub.type}_NODE
                                      </div>
                                      <h4 className={`font-bold text-lg tracking-tight leading-none uppercase transition-colors ${isSelected ? 'text-white' : 'text-slate-900'}`}>{sub.name}</h4>
                                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-indigo-200' : 'text-slate-300'}`}>
                                        <Zap size={12} className={isSelected ? 'text-white' : 'text-slate-300'} />
                                        {sub.code}
                                      </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border ${isSelected ? 'bg-white text-indigo-600 border-white' : 'bg-white text-slate-200 border-slate-100 shadow-sm'}`}>
                                      {isSelected ? <CheckCircle2 size={24} /> : <Plus size={20} />}
                                    </div>
                                  </div>

                                  <div className={`flex items-center justify-between pt-4 border-t ${isSelected ? 'border-indigo-500/50' : 'border-slate-200/50'}`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                      {cur.sections || 1} Units
                                    </span>
                                    {isMaxReached && !isSelected && (
                                      <span className="text-[9px] font-bold uppercase text-rose-500 tracking-widest leading-none">Limit Met</span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Additional Notes */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                <FileText size={24} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] italic leading-none">Requirements Override</h3>
            </div>
            <textarea 
              rows={4}
              placeholder="Specify preferred session intervals or facility access..."
              className="saas-input p-6 bg-slate-50 border-slate-200 rounded-3xl resize-none font-medium text-sm text-slate-900 placeholder:text-slate-300 focus:bg-white transition-all shadow-inner"
              value={form.additionalNotes}
              onChange={(e) => setForm(f => ({ ...f, additionalNotes: e.target.value }))}
            />
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Compass size={16} className="text-indigo-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">軟约束: soft parameters for the generation engine.</p>
            </div>
          </motion.div>
        </div>

        {/* Workload Monitor Sidebar */}
        <div className="w-full xl:w-[420px] sticky top-10">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white flex flex-col gap-10 p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 h-[calc(100vh-120px)] overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-none uppercase">
                   Grid <span className="text-indigo-600 font-medium">Monitor</span>
                 </h3>
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                    <Monitor size={22} />
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100">
                 <Cpu size={18} className="text-indigo-600 animate-spin" />
                 <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-none">Real-time Topology Syncing</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1">
              {val.sections.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-center gap-8 opacity-40">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                    <Box size={40} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[180px]">Assign teaching nodes to initialize workload monitor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {val.sections.map(s => (
                    <motion.div 
                      key={`${s.sem}-${s.sec}`} 
                      className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm bg-white flex flex-col gap-6 ${s.isValid ? 'border-slate-100 group hover:border-indigo-300' : 'border-rose-100 bg-rose-50/20'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`w-1.5 h-6 rounded-full ${s.isValid ? 'bg-indigo-600' : 'bg-rose-500'}`} />
                           <span className="font-bold text-base text-slate-900 uppercase">Phase_{s.sem} <span className="text-slate-300 mx-1">/</span> {s.sec}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${s.isValid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                          {s.isValid ? 'Ready' : 'Bound Warning'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={`flex flex-col p-4 rounded-xl border transition-all ${s.theory >= 1 && s.theory <= 3 ? 'bg-white border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Theory Nodes</span>
                           <h5 className="text-3xl font-bold text-slate-900 leading-none">{s.theory}<span className="text-xs text-slate-300 ml-1">/ 3</span></h5>
                        </div>
                        <div className={`flex flex-col p-4 rounded-xl border transition-all ${s.lab >= 1 && s.lab <= 2 ? 'bg-white border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Lab Nodes</span>
                           <h5 className="text-3xl font-bold text-slate-900 leading-none">{s.lab}<span className="text-xs text-slate-300 ml-1">/ 2</span></h5>
                        </div>
                      </div>

                      {!s.isValid && (
                         <div className="flex items-center gap-2 text-rose-500">
                            <AlertTriangle size={14} />
                             <p className="text-[9px] font-bold uppercase tracking-widest">Saturation Conflict</p>
                         </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-8">
              {!val.isAllValid && val.sections.length > 0 && (
                <div className="flex flex-col gap-3 bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-rose-500" size={18} />
                    <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-none">Structural Exception</h4>
                  </div>
                  <p className="text-[10px] font-medium text-rose-400 leading-relaxed uppercase tracking-tight">
                    Bound requirements (1-3 Theory & 1-2 Lab) must be satisfied for synchronization.
                  </p>
                </div>
              )}

              <button 
                onClick={handleSubmit}
                disabled={saving || !val.isAllValid || val.sections.length === 0}
                className="premium-button w-full h-16 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-30 disabled:shadow-none"
              >
                {saving ? (
                  <Activity size={20} className="animate-spin" />
                ) : (
                  <Fingerprint size={20} />
                )}
                {saving ? 'Synchronizing...' : (existing ? 'Override Registry' : 'Establish Commit')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
