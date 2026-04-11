import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Globe,
  Fingerprint,
  Activity,
  Cpu,
  AlertTriangle,
  Zap,
  ChevronRight,
  LockKeyhole
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication protocol failed. Identity mapping error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 overflow-hidden">
      {/* Left Side: Professional Branding */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-20 bg-white border-r border-slate-200">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 w-full max-w-md space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100"
          >
            <Cpu size={32} className="text-white" />
          </motion.div>

          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight"
            >
              Academic <br />
              <span className="text-indigo-600">Timetable System</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-base font-medium leading-relaxed"
            >
              The central node for institutional synchronization, personnel management, and automated scheduling logic.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-8 pt-10 border-t border-slate-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">Secured Data Locus</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">End-to-end identity encryption enforced across all administrative nodes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Globe size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">Global Propagation</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">Distributed synchronization across institutional departmental clusters.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-20">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-200" />
             <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Mainframe Status: Operational</p>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Portal */}
      <div className="flex items-center justify-center p-6 lg:p-20 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm space-y-10"
        >
          <div className="text-center lg:text-left space-y-1 ml-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Access <span className="text-indigo-600 font-medium">Gateway</span></h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Identify Credentials to Continue</p>
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

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Official Identifier</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="email"
                      placeholder="name@institution.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="saas-input h-12 pl-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Security Token</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
              </div>

              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                   <span className="text-[11px] font-bold text-slate-400">Remember node</span>
                </div>
                <Link to="/forgot-password" title="Forgot Signature?" className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                  Lost credentials?
                </Link>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="premium-button w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-indigo-100"
              >
                {loading ? <Activity size={18} className="animate-spin" /> : <Fingerprint size={18} />}
                {loading ? 'Initializing Connection...' : 'Establish Session'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <Link to="/signup" className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group">
                Request new provision <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
