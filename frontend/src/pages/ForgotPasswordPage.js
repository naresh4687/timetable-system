import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  Mail, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  ArrowLeft,
  Fingerprint,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const toastId = toast.loading('Synchronizing identity recovery protocols...');
    try {
      const res = await authAPI.forgotPassword(email);
      setResetToken(res.data.resetToken || '');
      setSubmitted(true);
      toast.success('Identity recovery token generated', { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registry synchronization failure. Please verify credentials.';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetToken);
    toast.success('Token crystallized to clipboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -mr-48 -mt-48" />
      
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
                className="w-16 h-16 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-inner"
              >
                 <KeyRound size={32} />
              </motion.div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase leading-none">
                 Recover <span className="text-indigo-600 font-medium">Identity</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Authentication Registry Access</p>
           </div>

           <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                   <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                         <CheckCircle2 size={24} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-900 uppercase">Token Generated</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Identity protocols active.</p>
                      </div>
                   </div>

                   {resetToken && (
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-4 block">Recovery Signature</label>
                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col gap-6 shadow-inner">
                           <code className="block break-all text-xs font-bold text-slate-500 text-center tracking-widest bg-white p-6 rounded-xl border border-slate-100 shadow-sm uppercase">
                              {resetToken}
                           </code>
                           <button 
                             onClick={copyToClipboard}
                             className="h-12 w-full bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                           >
                              <Copy size={16} /> Crystallize Token
                           </button>
                        </div>
                     </div>
                   )}

                   <div className="pt-4">
                      <Link 
                        to={resetToken ? `/reset-password/${resetToken}` : '/reset-password/'}
                        className="premium-button h-14 w-full rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                         Execute Reset Protocol <ArrowRight size={18} />
                      </Link>
                   </div>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
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

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-2 block">Institutional ID (Email)</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input 
                           type="email" 
                           placeholder="name@institution.edu" 
                           value={email}
                           onChange={(e) => setEmail(e.target.value)} 
                           required 
                           autoFocus
                           className="saas-input h-12 pl-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl" 
                         />
                      </div>
                      <div className="flex items-start gap-4 mt-4 ml-2">
                         <Activity size={14} className="text-indigo-400" />
                         <p className="text-[9px] font-bold text-slate-400 italic leading-relaxed uppercase tracking-tight">
                            A recovery node will be established and broadcast to your encrypted inbox.
                         </p>
                      </div>
                   </div>

                   <button 
                     disabled={loading}
                     className="premium-button h-14 w-full rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                   >
                      {loading ? (
                        <Activity size={18} className="animate-spin" />
                      ) : (
                        <>Generate Recovery Token <Zap size={18} /></>
                      )}
                   </button>
                </motion.form>
              )}
           </AnimatePresence>

           <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
              <Link to="/login" className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-400 tracking-widest hover:text-indigo-600 transition-all group">
                 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                 Return to Login Nexus
              </Link>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
