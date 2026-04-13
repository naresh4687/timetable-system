import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  ClipboardCheck, 
  BookOpen, 
  CircleCheck, 
  Plus, 
  GraduationCap, 
  FileText, 
  Building2, 
  CircleUser, 
  ShieldBan,
  LogOut,
  Cpu,
  ShieldCheck,
  Layout,
  Fingerprint
} from 'lucide-react';

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { section: 'Registry' },
    { label: 'Departments', icon: Building2, to: '/departments' },
    { label: 'Users', icon: Users, to: '/users' },
    { label: 'Constraints', icon: ShieldBan, to: '/constraints' },
    { label: 'Batches', icon: CalendarDays, to: '/batches' },
    { section: 'Allocation' },
    { label: 'Approved Logs', icon: CircleCheck, to: '/assignments' },
    { label: 'Master Timetable', icon: CalendarDays, to: '/timetables' },
    { label: 'Staff Reqs', icon: ClipboardCheck, to: '/expectations' },
    { section: 'Identity' },
    { label: 'Terminal Profile', icon: CircleUser, to: '/profile' },
  ],
  manager: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { section: 'Curriculum' },
    { label: 'Curriculum', icon: BookOpen, to: '/curriculum' },
    { section: 'Timetable' },
    { label: 'Subject Allocated', icon: CircleCheck, to: '/assignments' },
    { label: 'Timetables', icon: CalendarDays, to: '/timetables' },
    { label: 'Create Timetable', icon: Plus, to: '/timetables/new' },
    { section: 'Personnel' },
    { label: 'Staff List', icon: GraduationCap, to: '/staff' },
    { section: 'Account' },
    { label: 'My Profile', icon: CircleUser, to: '/profile' },
  ],
  staff: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { section: 'Operational' },
    { label: 'View Timetable', icon: CalendarDays, to: '/timetables' },
    { label: 'Subject Preferences', icon: FileText, to: '/preferences' },
    { section: 'Account' },
    { label: 'My Profile', icon: CircleUser, to: '/profile' },
  ],
  student: [
    { label: 'View Timetable', icon: CalendarDays, to: '/timetables' },
    { section: 'Account' },
    { label: 'My Profile', icon: CircleUser, to: '/profile' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = navConfig[user?.role] || [];

  return (
    <aside className="w-72 bg-white h-screen flex flex-col border-r border-slate-200 sticky top-0 shrink-0 z-50 shadow-sm">
      {/* Brand - Modern Institutional Style */}
      <div className="p-10 pb-12">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:scale-105 transition-all duration-500">
            <Cpu size={26} className="group-hover:rotate-90 transition-transform duration-700" />
          </div>
          <div>
            <h1 className="text-slate-900 font-bold text-xl leading-none uppercase tracking-tight">
              NARESH<span className="text-indigo-600">.B.A</span>
            </h1>
            <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mt-2 leading-none">SOFTERWARE SOLUTIONS</p>
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto py-2 no-scrollbar">
        {links.map((item, i) =>
          item.section ? (
            <div key={i} className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] px-4 pt-10 pb-4">
              {item.section}
            </div>
          ) : (
            <motion.div
              key={i}
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) => 
                  `sidebar-link group
                  ${isActive 
                    ? 'active bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={`shrink-0 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:text-indigo-500 group-hover:scale-110'}`} />
                    <span className={`transition-colors duration-300 font-semibold ${isActive ? '' : ''}`}>{item.label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          )
        )}
      </nav>


    </aside>
  );
}
