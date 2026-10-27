import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      toast.error(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('alex.developer@interviewlab.dev');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/questions" className="inline-flex items-center gap-2 group py-1">
            <span className="text-3xl font-extrabold tracking-[-0.04em] text-[#181212] group-hover:text-[#2D80FD] transition-colors leading-none select-none">
              Interview<span className="text-[#2D80FD]">Lab</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-[#181212]">
            Welcome back
          </h1>
          <p className="text-xs text-[#837D7D]">
            Sign in to access your interview practice sessions and track metrics
          </p>
        </div>

        <div className="sp-card sp-card-white p-8 sm:p-9 rounded-[32px] border border-[#EAEAEA] space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#837D7D] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#837D7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F8] border border-[#EAEAEA] text-sm text-[#181212] focus:outline-hidden focus:border-[#2D80FD] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#837D7D] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#2D80FD] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#837D7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F8] border border-[#EAEAEA] text-sm text-[#181212] focus:outline-hidden focus:border-[#2D80FD] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-muryn-blue justify-center text-sm py-3 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo User Fast Fill */}
          <div className="pt-3 border-t border-[#EAEAEA]">
            <button
              type="button"
              onClick={handleFillDemoUser}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#FAF8F8] hover:bg-neutral-100 border border-[#EAEAEA] text-xs font-semibold text-[#181212] transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2D80FD]" />
              <span>Fill Demo Credentials (Alex Rivera)</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#837D7D]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[#2D80FD] hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};
