import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  Clock,
  History,
  BarChart3,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const menuItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Question Library', to: '/questions', icon: <Terminal className="w-4 h-4" /> },
    { label: 'Start Interview', to: '/interview/setup', icon: <Clock className="w-4 h-4" /> },
    { label: 'Interview History', to: '/interview/history', icon: <History className="w-4 h-4" /> },
    { label: 'Progress Analytics', to: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Profile & Settings', to: '/profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 transition-all duration-200 flex flex-col justify-between hidden lg:flex ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-3 space-y-1.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-violet-600/20 text-white border border-violet-500/40 shadow-glow-violet'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              } ${!isOpen ? 'justify-center px-2' : ''}`
            }
            title={!isOpen ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {isOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Bottom section with Collapse toggle & Runner badge */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {isOpen && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Isolated Runner</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Zero secret leaks • Node 18 & Python 3.10
            </p>
          </div>
        )}

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
