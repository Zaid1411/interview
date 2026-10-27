import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/Button.js';
import {
  Code2,
  Terminal,
  Clock,
  BarChart2,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const Navbar: React.FC<{ toggleSidebar?: () => void; isSidebarOpen?: boolean }> = ({
  toggleSidebar,
  isSidebarOpen,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Question Library', href: '/questions', icon: <Terminal className="w-3.5 h-3.5" /> },
    { label: 'Timed Interviews', href: '/interview/setup', icon: <Clock className="w-3.5 h-3.5" /> },
    ...(user
      ? [
          { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
          { label: 'Analytics', href: '/analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
        ]
      : []),
  ];

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition lg:flex hidden border border-white/5"
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#FFDB08] text-black border-2 border-black flex items-center justify-center font-black shadow-brutal-black group-hover:scale-105 transition-all duration-200">
              <Code2 className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black tracking-tight text-white group-hover:text-[#FFDB08] transition-colors">
                INTERVIEW<span className="text-[#FFDB08]">LAB</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-black/60 p-1 rounded-full border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'text-black bg-[#FFDB08] shadow-sm border border-black font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Menu or Auth CTAs */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-violet-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#FFDB08] text-black font-black flex items-center justify-center text-xs uppercase shadow-sm border border-black">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-float border border-white/15 p-2 z-50 animate-in fade-in-50 zoom-in-95 text-slate-100">
                    <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {user.stats && (
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            {user.stats.solvedQuestions} Solved
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>{user.stats.completedInterviews} Mocks</span>
                        </div>
                      )}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/interview/history"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      Interview History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition mt-1 border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <button className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="px-5 py-2 rounded-full bg-[#FFDB08] text-black font-extrabold text-xs uppercase tracking-wider border-2 border-black shadow-brutal-black hover:bg-white transition-all flex items-center gap-1.5 group">
                  <span>Get Started</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-1.5 animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="brand" className="w-full">
                  Create Free Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
