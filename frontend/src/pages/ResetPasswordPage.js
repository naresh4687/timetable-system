import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Fingerprint,
  ShieldAlert,
  Zap,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { 
      const msg = 'Security threshold failure: Password must exceed 6 characters.';
      setError(msg);
      toast.error(msg);
      return; 
    }
    if (password !== confirm) { 
      const msg = 'Registry mismatch: Passwords do not align.';
      setError(msg);
      toast.error(msg);
      return; 
    }
    
    setLoading(true);
    const toastId = toast.loading('Synchronizing security recalibration...');
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      toast.success('Security protocols updated successfully', { id: toastId });
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired signature. Please request a new recovery node.';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -ml-48 -mb-48" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white p-10 lg:p-14 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
           {/* Header */}
           <div className="flex flex-col items-center text-center mb-12">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 mb-6 shadow-sm"
              >
                 <ShieldCheck size={32} />
              </motion.div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase leading-none">
                 Security <span className="text-indigo-600 font-medium">Recalibration</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Lattice Reset Terminal</p>
           </div>

           <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 text-center"
                >
                   <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex flex-col items-center gap-6 shadow-inner">
                      <div className="w-16 h-16 bg-white border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                         <CheckCircle2 size={32} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 uppercase">Access Restored</h3>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                           Protocols synchronized successfully.
                        </p>
                      </div>
                   </div>

                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3">
                      <Activity size={16} className="text-indigo-600 animate-spin" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         Redirecting to nexus in <span className="text-slate-900">4s</span>...
                      </p>
                   </div>

                   <button 
                     onClick={() => navigate('/login')}
                     className="premium-button h-14 w-full rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                   >
                      Manual Redirect <ArrowRight size={18} />
                   </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                   {error && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3 text-rose-600 shadow-sm"
                     >
                        <AlertCircle size={18} className="shrink-0" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">{error}</p>
                     </motion.div>
                   )}

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-2 block">New Signature (Password)</label>
                         <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Min. 8 alphanumeric chars" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)} 
                              required 
                              autoFocus
                              minLength={6}
                              className="saas-input h-12 pl-12 pr-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-all"
                            >
                               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-2 block">Verify Signature</label>
                         <div className="relative">
                            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                              type={showConfirm ? "text" : "password"} 
                              placeholder="Repeat new signature" 
                              value={confirm}
                              onChange={(e) => setConfirm(e.target.value)} 
                              required 
                              className="saas-input h-12 pl-12 pr-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-all"
                            >
                               {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                         </div>
                      </div>
                   </div>

                   <button 
                     disabled={loading}
                     className="premium-button h-14 w-full rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
                   >
                      {loading ? (
                        <Activity size={18} className="animate-spin" />
                      ) : (
                        <>Synchronize Signature <Zap size={18} /></>
                      )}
                   </button>
                </motion.form>
              )}
           </AnimatePresence>

           <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
              <Link to="/forgot-password" title="Request new recovery node" className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-400 tracking-widest hover:text-indigo-600 transition-all group">
                 <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                 New Recovery Node
              </Link>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
