import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import { 
  LogOut, 
  Search, 
  Bell, 
  ChevronRight,
  User,
  Settings,
  ShieldCheck,
  Command,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Generate breadcrumbs from path
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="premium-navbar">
      {/* Left: Breadcrumbs & Institutional Branding */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="breadcrumb-item">
            INFRASTRUCTURE
          </Link>
          {pathnames.length > 0 && <span className="breadcrumb-separator" />}
          
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

            return (
              <div key={to} className="flex items-center gap-2">
                <Link 
                  to={to} 
                  className={`breadcrumb-item ${isLast ? 'text-slate-900 font-bold' : ''}`}
                >
                  {value.toUpperCase().replace(/-/g, ' ')}
                </Link>
                {!isLast && <span className="breadcrumb-separator" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: Command Search (Visual) */}
      <div className="search-placeholder group">
        <Search size={14} className="group-hover:text-indigo-600 transition-colors" />
        <span className="text-[11px] font-semibold">Search system registry...</span>
        <div className="ml-auto px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400">
          <Command size={10} className="inline mr-1" /> K
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm">
            <Bell size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm">
             <Activity size={18} />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate('/profile')}
          >
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">
                {user?.name}
              </div>

            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-xl bg-indigo-50 p-px shadow-md transition-transform border border-indigo-100"
            >
              <div className="w-full h-full rounded-[0.6rem] bg-white flex items-center justify-center text-indigo-600 font-bold text-xs shadow-inner overflow-hidden">
                {user?.profileImage ? (
                  <img 
                    src={getImageUrl(user.profileImage)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </motion.div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center active:scale-95 border border-rose-100 shadow-sm"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
