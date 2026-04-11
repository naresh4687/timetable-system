import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { curriculumAPI, masterSubjectAPI, departmentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, 
  Trash2, 
  Save, 
  Upload, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  X, 
  LayoutGrid, 
  Building2, 
  Layers, 
  Info,
  BookOpen,
  Settings,
  Library,
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  Activity,
  Cpu,
  Fingerprint,
  RotateCcw,
  Database,
  Layout,
  ArrowUpRight,
  Globe,
  ChevronRight
} from 'lucide-react';

const emptySubject = () => ({
  semester: 1, name: '', code: '', type: 'theory', credits: '', hoursPerWeek: '',
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

export default function CurriculumPage() {
  const navigate = useNavigate();
  const [allCurricula, setAllCurricula] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [newMaster, setNewMaster] = useState({ name: '', code: '', type: 'theory', credits: 3, hoursPerWeek: 3 });
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [sections, setSections] = useState(1);
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [saving, setSaving] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [expandedSems, setExpandedSems] = useState(new Set([1]));
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [semesterType, setSemesterType] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [curriculumRes, masterRes, deptRes] = await Promise.all([
        curriculumAPI.getAll(),
        masterSubjectAPI.getAll().catch(() => ({ data: { subjects: [] } })),
        departmentAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setMasterSubjects(masterRes.data.subjects || []);
      setDepartments(deptRes.data || []);
      const data = curriculumRes.data;
      setAllCurricula(data.curricula);
      if (data.curricula.length > 0) {
        let flattened = [];
        setAcademicYear(data.curricula[0].academicYear);
        setSections(data.curricula[0].sections);
        data.curricula.forEach(c => {
          c.subjects.forEach(s => { flattened.push({ ...s, semester: c.semester }); });
        });
        if (flattened.length > 0) {
          flattened.sort((a, b) => a.semester - b.semester);
          setSubjects(flattened);
          setExpandedSems(new Set([flattened[0].semester]));
        } else {
          setSubjects([emptySubject()]);
        }
      }
    } catch { }
    finally { setLoadingAll(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateSubject = (idx, field, value) => {
    setSubjects(prev => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };
  const addSubject = () => setSubjects(prev => [...prev, emptySubject()]);
  const removeSubject = (idx) => { if (subjects.length === 1) return; setSubjects(prev => prev.filter((_, i) => i !== idx)); };

  const handleCreateMaster = async (e) => {
    e.preventDefault();
    if (!newMaster.name || !newMaster.code) return;
    try {
      const { data } = await masterSubjectAPI.create(newMaster);
      setMasterSubjects(prev => [...prev, data.subject]);
      toast.success('Subject cataloged in master library');
      setNewMaster({ name: '', code: '', type: 'theory', credits: 3, hoursPerWeek: 3 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Master catalog failure');
    }
  };

  const handleSave = async () => {
    const valid = subjects.every(s => s.semester && s.name && s.code && s.credits && s.hoursPerWeek);
    if (!valid) { toast.error('Incomplete data. Every field must be established.'); return; }
    setSaving(true);
    const grouped = {};
    for (const s of subjects) {
      if (!grouped[s.semester]) grouped[s.semester] = [];
      grouped[s.semester].push({ name: s.name, code: s.code, type: s.type, credits: Number(s.credits), hoursPerWeek: Number(s.hoursPerWeek) });
    }
    try {
      await Promise.all(
        Object.entries(grouped).map(([sem, subs]) =>
          curriculumAPI.save({ semester: Number(sem), academicYear, sections, subjects: subs })
        )
      );
      toast.success('Institutional curriculum synchronized');
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synchronization failed');
    } finally { setSaving(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    const toastId = toast.loading('Decoding structural data...');
    try {
      const { data } = await curriculumAPI.parseFile(file);
      if (data.subjects && data.subjects.length > 0) {
        let flattened = [];
        data.subjects.forEach(group => {
          group.subjects.forEach(s => { flattened.push({ ...s, semester: group.semester }); });
        });
        if (flattened.length > 0) {
          setSubjects(flattened);
          toast.success('Data decoded. Review established nodes.', { id: toastId });
        } else {
          toast.error('Mapping logic failure: no semester correlation.', { id: toastId });
        }
      } else {
        toast.error('No structural nodes extracted.', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Decoder failure.', { id: toastId });
    } finally {
      setParsing(false);
      e.target.value = null;
    }
  };

  const handleGenerate = async () => {
    if (!selectedDept) return toast.error('Department target required');
    if (!semesterType) return toast.error('Cycle target required');

    setGenerating(true);
    const cycleName = semesterType === 'odd' ? 'Odd Cycle' : 'Even Cycle';
    const toastId = toast.loading(`Initializing ${cycleName} generation for ${selectedDept}...`);
    try {
      const payload = { 
        department: selectedDept, 
        semesterType, 
        semester: 0, 
        title: `${selectedDept} - ${cycleName} (${academicYear})`
      };
      await curriculumAPI.generate(payload);
      toast.success(`✅ Generation protocol complete for ${selectedDept}`, { id: toastId });
      navigate('/timetables');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation protocol failed.', { id: toastId });
    } finally { setGenerating(false); }
  };

  const subjectsBySem = (sem) => subjects.filter(s => s.semester === sem);
  const hasCurriculum = (sem) => allCurricula.some(c => c.semester === sem);

  const toggleSem = (sem) => {
    setExpandedSems(prev => {
      const next = new Set(prev);
      next.has(sem) ? next.delete(sem) : next.add(sem);
      return next;
    });
  };

  if (loadingAll) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Analyzing Structural DNA...</p>
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
                Curriculum <span className="text-indigo-600 font-medium">Architect</span>
             </h1>
          </motion.div>
          <p className="text-slate-500 font-medium text-sm ml-4">
             Map institutional semester hierarchies and initialize automated allocation cycles.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <label className="h-12 px-6 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2.5 cursor-pointer hover:bg-slate-50 transition-all active:scale-95 group w-full lg:w-auto shadow-sm">
            <Upload size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Bulk Import</span>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={parsing} />
          </label>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="premium-button h-12 px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95 transition-all w-full lg:w-auto"
          >
            <Save size={16} />
            {saving ? 'Syncing...' : 'Sync Matrix'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Generation Terminal */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-10 space-y-8 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Zap size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Engine Control</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Allocation cycle initialization</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 ${!selectedDept || !semesterType ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                   {!selectedDept || !semesterType ? <Info size={14} /> : <CheckCircle2 size={14} />}
                   {!selectedDept || !semesterType ? 'Selection Needed' : 'Lattice Ready'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Target Cluster</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    <select 
                      value={selectedDept} 
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="saas-input pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white appearance-none cursor-pointer text-[11px] font-bold uppercase tracking-wider"
                    >
                      <option value="">Search Departments...</option>
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Phase Cycle</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    <select 
                      value={semesterType} 
                      onChange={(e) => setSemesterType(e.target.value)}
                      className="saas-input pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white appearance-none cursor-pointer text-[11px] font-bold uppercase tracking-wider"
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
                disabled={generating || !selectedDept || !semesterType}
                className="premium-button w-full h-14 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100/50 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {generating ? (
                  <Activity className="animate-spin" size={18} />
                ) : <Sparkles size={18} />}
                {generating ? 'Executing Algorithm...' : 'Trigger Automated Allocation'}
              </button>
            </div>
          </motion.div>

          {/* Master Library Terminal */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                  <Library size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Subject Library</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define master curriculum objects</p>
                </div>
              </div>

              <form onSubmit={handleCreateMaster} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Title</label>
                  <input className="saas-input h-11 bg-slate-50 border-slate-100 focus:bg-white" value={newMaster.name} onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })} placeholder="e.g. AI Systems" required />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">ID Code</label>
                   <input className="saas-input h-11 bg-slate-50 border-slate-100 focus:bg-white text-center font-bold tracking-widest" value={newMaster.code} onChange={(e) => setNewMaster({ ...newMaster, code: e.target.value })} placeholder="CS501" required />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Class</label>
                   <select className="saas-input h-11 bg-slate-50 border-slate-100 focus:bg-white px-2 text-[10px] font-bold uppercase tracking-wider" value={newMaster.type} onChange={(e) => setNewMaster({ ...newMaster, type: e.target.value })}>
                     <option value="theory">Theory</option>
                     <option value="lab">Lab Node</option>
                   </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-1">Value</label>
                   <input type="number" className="saas-input h-11 bg-slate-50 border-slate-100 focus:bg-white text-center font-bold" value={newMaster.credits} onChange={(e) => setNewMaster({ ...newMaster, credits: Number(e.target.value) })} required />
                </div>
                <button type="submit" className="h-11 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center active:scale-95 shadow-sm">
                  <Plus size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Global Config */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2rem] border border-indigo-200 shadow-xl shadow-indigo-100/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] -mr-16 -mt-16" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Lattice Configuration</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Academic Cycle</label>
                  <input className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 text-slate-900 font-bold text-sm outline-none focus:border-indigo-500 transition-all uppercase tracking-widest" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Cluster Multiplier (Sections)</label>
                  <div className="flex items-center gap-3">
                    <input type="number" min={1} max={10} className="w-16 h-12 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-900 font-bold" value={sections} onChange={(e) => setSections(Math.max(1, Number(e.target.value)))} />
                    <div className="flex-1 h-12 bg-indigo-50/30 rounded-xl border border-dashed border-indigo-100 flex items-center justify-center font-bold text-[11px] text-indigo-700 tracking-[0.2em] uppercase">
                       Layers: {Array.from({ length: sections }, (_, i) => String.fromCharCode(65 + i)).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4"
          >
            <Info className="text-indigo-400 mt-0.5 shrink-0" size={16} />
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
              Calibrating multipliers will recalculate all phase nodes. Verify integrity before synchronization to avoid data fragmentation.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Semester Hierarchy */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <LayoutGrid size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Phase Hierarchy</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Semester node mapping</p>
             </div>
          </div>
          <button 
            onClick={addSubject}
            className="h-10 px-5 bg-white border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <Plus size={16} /> Append Resource Node
          </button>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {[1,2,3,4,5,6,7,8].map(sem => {
            const semSubjects = subjectsBySem(sem);
            const isExpanded = expandedSems.has(sem);
            const saved = hasCurriculum(sem);
            
            return (
              <motion.div key={sem} variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                <div onClick={() => toggleSem(sem)} className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-6">
                     <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-300 border ${saved ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                        <span className="text-[8px] uppercase leading-none mb-1 opacity-70">Phase</span>
                        <span className="text-2xl leading-none">{sem}</span>
                     </div>
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                           <h4 className="text-lg font-bold text-slate-900 tracking-tight">Active Matrix {sem}</h4>
                           {saved && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-bold uppercase tracking-widest">Synced</span>}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><BookOpen size={12} className="opacity-50" /> {semSubjects.length} Objectives</span>
                           <div className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-indigo-600/70">{semSubjects.filter(s => s.type === 'theory').length} Theory</span>
                           <div className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-emerald-500/70">{semSubjects.filter(s => s.type === 'lab').length} Lab</span>
                        </div>
                     </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-300 transition-all duration-300 ${isExpanded ? 'rotate-180 border-indigo-500 text-indigo-600 shadow-sm' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 overflow-hidden">
                      <div className="p-8 overflow-x-auto no-scrollbar">
                        {semSubjects.length === 0 ? (
                           <div className="py-20 text-center space-y-4">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto border border-dashed border-slate-200">
                                 <Database size={24} />
                              </div>
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No structural objects assigned to this phase</p>
                           </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="pb-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">IDX</th>
                                <th className="pb-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Object Title (Subject)</th>
                                <th className="pb-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                                <th className="pb-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class</th>
                                <th className="pb-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Value</th>
                                <th className="pb-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">HR/W</th>
                                <th className="pb-4"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {semSubjects.map((sub, relIdx) => {
                                const absIdx = subjects.indexOf(sub);
                                return (
                                  <tr key={absIdx} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                    <td className="py-4"><span className="text-[11px] font-bold text-slate-300">{relIdx + 1}</span></td>
                                    <td className="py-4 min-w-[280px]">
                                      <div className="relative group/search">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/search:text-indigo-400 transition-colors" size={14} />
                                        <input list={`subj-names-${absIdx}`} value={sub.name} onChange={e => {
                                            const val = e.target.value;
                                            const matched = masterSubjects.find(m => m.name === val);
                                            if (matched) {
                                              setSubjects(prev => {
                                                const next = [...prev];
                                                next[absIdx] = { ...next[absIdx], name: matched.name, code: matched.code, type: matched.type, credits: matched.credits, hoursPerWeek: matched.hoursPerWeek };
                                                return next;
                                              });
                                            } else { updateSubject(absIdx, 'name', val); }
                                          }} placeholder="Registry Search..." className="w-full h-10 bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-4 text-[13px] font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-300 transition-all shadow-inner" />
                                        <datalist id={`subj-names-${absIdx}`}>
                                          {masterSubjects.map(m => <option key={m._id || m.code} value={m.name} />)}
                                        </datalist>
                                      </div>
                                    </td>
                                    <td className="py-4 text-center"><input className="w-full h-10 bg-slate-50 border border-slate-100 rounded-lg px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center focus:bg-white focus:border-indigo-300 outline-none" value={sub.code} onChange={e => updateSubject(absIdx, 'code', e.target.value)} /></td>
                                    <td className="py-4">
                                      <select className="h-10 bg-slate-50 border border-slate-100 rounded-lg px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 focus:bg-white focus:border-indigo-300 outline-none cursor-pointer" value={sub.type} onChange={e => updateSubject(absIdx, 'type', e.target.value)}>
                                        <option value="theory">Theory</option>
                                        <option value="lab">Lab Node</option>
                                      </select>
                                    </td>
                                    <td className="py-4"><input type="number" className="w-14 h-10 bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-slate-700 focus:bg-white focus:border-indigo-300 outline-none" value={sub.credits} onChange={e => updateSubject(absIdx, 'credits', e.target.value)} /></td>
                                    <td className="py-4"><input type="number" className="w-14 h-10 bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-slate-700 focus:bg-white focus:border-indigo-300 outline-none" value={sub.hoursPerWeek} onChange={e => updateSubject(absIdx, 'hoursPerWeek', e.target.value)} /></td>
                                    <td className="py-4 text-right">
                                      {subjects.length > 1 && (
                                        <button onClick={() => removeSubject(absIdx)} className="w-9 h-9 rounded-lg text-rose-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0">
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Aggregate Index Footer */}
      <div className="bg-white p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-200 shadow-xl shadow-slate-200/50">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 animate-pulse">
               <Fingerprint size={32} />
            </div>
            <div className="space-y-1.5">
               <p className="text-lg font-bold text-slate-900 leading-none">Global Architecture Index</p>
               <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest max-w-sm">
                 Institutional integrity enforced by structural boundaries.
               </p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all shadow-inner">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Total Value</span>
               <span className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform block">{subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)} <span className="text-sm">CREDITS</span></span>
            </div>
            <div className="px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-200 transition-all shadow-inner">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Lattice Velocity</span>
               <span className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors block">{subjects.reduce((sum, s) => sum + (Number(s.hoursPerWeek) || 0), 0)} <span className="text-sm text-slate-400">HR/W</span></span>
            </div>
         </div>
      </div>
    </div>
  );
}
