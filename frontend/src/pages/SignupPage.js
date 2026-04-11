import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowLeft,
  Building2,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Fingerprint,
  Activity,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Layers,
  Globe,
  ArrowRight
} from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration protocol failed. Data integrity mapping error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 overflow-hidden">
      {/* Registration Side */}
      <div className="flex items-center justify-center p-6 lg:p-20 bg-white relative border-r border-slate-200">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative w-full max-w-lg"
        >
          <div className="mb-10 text-center lg:text-left space-y-1 ml-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Registry <span className="text-indigo-600 font-medium">Initialization</span></h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Onboard identity to the institutional lattice</p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-center gap-2 mb-8 text-[11px] font-bold uppercase"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Full Identity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Carter"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoFocus
                      className="saas-input h-12 pl-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Institutional Mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="email"
                      name="email"
                      placeholder="name@institution.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="saas-input h-12 pl-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Access Protocol (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="saas-input h-12 pl-12 pr-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-all"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Access Tier</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    required
                    className="saas-input h-12 px-4 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-[11px] font-bold uppercase tracking-widest cursor-pointer appearance-none"
                  >
                    <option value="student">Student Module</option>
                    <option value="staff">Faculty / Associate</option>
                    <option value="manager">Lead / Coordinator</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Structural Segment</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      name="department"
                      placeholder="e.g. CSE Dept"
                      value={formData.department}
                      onChange={handleChange}
                      className="saas-input h-12 pl-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="premium-button w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-indigo-100 mt-4"
              >
                {loading ? <Activity size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {loading ? 'Initializing Node...' : 'Establish Identity'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <Link to="/login" className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group">
                 <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                 Return to Access Portal
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Branding Side */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-20 bg-slate-50">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 w-full max-w-md space-y-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-xl shadow-slate-200/50"
          >
            <Sparkles size={32} className="text-indigo-600" />
          </motion.div>

          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold text-slate-900 leading-tight tracking-tight uppercase"
            >
              Expand the <br />
              <span className="text-indigo-600 font-medium whitespace-nowrap">Node Network</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-base font-medium leading-relaxed"
            >
              Request provisioning to join the distributed lattice of academic coordination and automated resource logic.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8 pt-10 border-t border-slate-200"
          >
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Globe size={18} className="text-indigo-600" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none">Global Integration</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">Identity propagation through localized institutional clusters.</p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={18} className="text-indigo-600" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none">Access Precision</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">Hierarchical permissions enforced across administrative segments.</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
