import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Menu,
  X,
  ExternalLink,
  Github,
  Linkedin,
  LogOut,
  User as UserIcon,
  Play,
} from 'lucide-react';

export const EditorialSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedSidebarEmail, setCopiedSidebarEmail] = useState(false);

  const handleSidebarCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('support@interviewlab.dev');
    setCopiedSidebarEmail(true);
    setTimeout(() => setCopiedSidebarEmail(false), 2000);
  };

  const navLinks = [
    { label: 'Questions', to: '/questions' },
    { label: 'Timed Mocks', to: '/interview/setup' },
    { label: 'Analytics', to: '/analytics' },
    ...(user
      ? [
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'History', to: '/interview/history' },
        ]
      : []),
  ];

  return (
    <>
      {/* =========================================================================
          1. DESKTOP FIXED SIDEBAR (lg:flex, exact murynmukha.com layout)
         ========================================================================= */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-60 bg-white border-r border-[#EAEAEA] flex-col justify-between p-8 z-40 select-none">
        {/* Top: Modern Brand Logo */}
        <div>
          <Link to="/questions" className="inline-flex items-center gap-2 group py-1">
            <span className="text-[23px] font-extrabold tracking-[-0.04em] text-[#181212] group-hover:text-[#2D80FD] transition-colors leading-none select-none">
              Interview<span className="text-[#2D80FD]">Lab</span>
            </span>
          </Link>
        </div>

        {/* Center: Vertical Navigation Links */}
        <nav className="flex flex-col gap-3.5 my-auto">
          {navLinks.map((link) => {
            const isHome = link.to === '/';
            const isActive = isHome
              ? location.pathname === '/'
              : location.pathname.startsWith(link.to);

            return (
              <NavLink
                key={link.label}
                to={link.to}
                className={`text-base font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-[#181212] font-bold'
                    : 'text-[#837D7D] hover:text-[#181212]'
                }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: Social / Auth Status */}
        <div className="pt-6 border-t border-[#EAEAEA] space-y-3 text-sm font-semibold text-[#837D7D]">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#181212] font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-[#1BE349]" />
                <span className="truncate">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-[#837D7D] hover:text-rose-600 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 text-xs font-semibold">
              <Link to="/login" className="hover:text-[#181212] transition">
                Sign In
              </Link>
              <Link to="/register" className="text-[#2D80FD] hover:underline font-bold">
                Get Started &rarr;
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-[14px] text-[#837D7D] font-normal pt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#181212] transition"
            >
              GitHub
            </a>
            <button
              onClick={handleSidebarCopyEmail}
              className="hover:text-[#181212] transition text-left flex items-center gap-1.5 relative"
            >
              <span>Email</span>
              {copiedSidebarEmail && (
                <span className="text-[11px] text-[#2D80FD] font-semibold">
                  (Copied!)
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE TOP HEADER (visible < lg)
         ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] px-6 h-16 flex items-center justify-between">
        <Link to="/questions" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-[-0.04em] text-[#181212]">
            Interview<span className="text-[#2D80FD]">Lab</span>
          </span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[#181212] hover:bg-neutral-100 rounded-xl transition"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Slideout Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-white z-50 p-8 flex flex-col justify-between animate-in fade-in">
            <nav className="flex flex-col gap-5 text-xl font-semibold">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#181212] hover:text-[#2D80FD] transition"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-6 border-t border-[#EAEAEA] flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-[#181212]">{user.name}</span>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-semibold text-rose-600"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 w-full">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full border border-[#EAEAEA] text-sm font-bold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full bg-[#2D80FD] text-white text-sm font-bold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
