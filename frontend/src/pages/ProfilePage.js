import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userAPI, getImageUrl } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Building2, 
  Pencil, 
  X, 
  Check, 
  Loader2, 
  Calendar, 
  Camera,
  ShieldCheck,
  User as UserIcon,
  Fingerprint,
  Cpu,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Globe,
  Zap,
  RotateCcw,
  Save,
  Shield,
  ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({ name: '', department: '', dob: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    userAPI.getProfile()
      .then(({ data }) => {
        setProfile(data.user);
        
        let formattedDob = '';
        if (data.user.dob) {
          formattedDob = new Date(data.user.dob).toISOString().split('T')[0];
        }

        setForm({
          name: data.user.name || '',
          department: data.user.department || '',
          dob: formattedDob,
        });
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false));
  };

  const initials = (name = '') =>
    name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    let formattedDob = '';
    if (profile.dob) {
      formattedDob = new Date(profile.dob).toISOString().split('T')[0];
    }
    setForm({ name: profile.name, department: profile.department, dob: formattedDob });
    setEditing(false);
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required.');
    if (!form.department.trim()) return toast.error('Department is required.');

    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({
        name: form.name.trim(),
        department: form.department.trim(),
        dob: form.dob || null
      });
      setProfile(data.user);
      setEditing(false);
      toast.success('Profile updated successfully!');

      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, name: data.user.name, department: data.user.department };
      localStorage.setItem('user', JSON.stringify(updated));
      window.dispatchEvent(new Event('profile-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file');
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await userAPI.uploadProfileImage(formData);
      setProfile(prev => ({ ...prev, profileImage: data.profileImage }));
      toast.success('Profile image updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
       </div>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Identity Node...</p>
    </div>
  );

  if (!profile) return null;

  const avatarUrl = getImageUrl(profile.profileImage);


  return (
    <div className="flex justify-center items-center py-10 lg:py-20">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-2xl p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        
        <div className="relative flex flex-col items-center">
          {/* Avatar Hub */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative group cursor-pointer mb-10"
            onClick={triggerFileInput}
          >
            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl relative overflow-hidden flex items-center justify-center">
               {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-4xl font-bold text-slate-300 uppercase tracking-tighter">{initials(profile.name)}</span>
               )}
               
               <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white">
                 {uploading ? (
                   <Activity className="w-8 h-8 animate-spin" />
                 ) : (
                   <>
                     <Camera className="w-8 h-8 mb-2" />
                     <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Modify</span>
                   </>
                 )}
               </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </motion.div>

          {/* Identity Header */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none uppercase truncate max-w-md">{profile.name}</h2>
            <div className="flex items-center justify-center gap-3">
               <div className="px-5 py-2 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">{profile.role} Access</span>
               </div>
               {profile.role === 'staff' && (
                 <div className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                    <Fingerprint size={16} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Class {profile.category || 'B'}</span>
                 </div>
               )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!editing ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-5 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
                       <Mail size={18} />
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identifier</p>
                       <p className="text-sm font-bold text-slate-700 truncate">{profile.email}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-5 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
                       <Building2 size={18} />
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cluster</p>
                       <p className="text-sm font-bold text-slate-700 truncate uppercase">{profile.department}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
                     <Calendar size={18} />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Node (DOB)</p>
                     <p className="text-sm font-bold text-slate-700 uppercase">{profile.dob ? new Date(profile.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Pending'}</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleEdit}
                    className="premium-button w-full h-14 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                  >
                    <Pencil size={18} /> Reconfigure Node Data
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="edit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-6"
                onSubmit={handleSave}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Full Identity Title</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Dr. Jordan Smith"
                        className="saas-input pl-12 h-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Institutional Segment</label>
                    <div className="relative">
                      <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        name="department"
                        type="text"
                        value={form.department}
                        onChange={handleChange}
                        placeholder="e.g. CSE Segment"
                        className="saas-input pl-12 h-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 block">Node Lifecycle (DOB)</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        name="dob"
                        type="date"
                        value={form.dob}
                        onChange={handleChange}
                        className="saas-input pl-12 h-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="h-12 rounded-xl bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="premium-button h-12 rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                  >
                    {saving ? <Activity className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                    {saving ? 'Syncing...' : 'Commit Work'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
