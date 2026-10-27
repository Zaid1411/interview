import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation helpers
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please satisfy all password security requirements.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Email may already be in use.');
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
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
            Create your account
          </h1>
          <p className="text-xs text-[#837D7D]">
            Start practicing with interactive Monaco coding rooms and timed interview sessions
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
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#837D7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F8] border border-[#EAEAEA] text-sm text-[#181212] focus:outline-hidden focus:border-[#2D80FD] focus:bg-white transition"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F8] border border-[#EAEAEA] text-sm text-[#181212] focus:outline-hidden focus:border-[#2D80FD] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#837D7D] uppercase tracking-wider">
                Password
              </label>
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

            {/* Password checklist */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F8] border border-[#EAEAEA] space-y-1 text-xs">
              <span className="font-semibold text-[#837D7D] uppercase tracking-wider block text-[10px]">
                Password Requirements
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                <div className={`flex items-center gap-1.5 ${hasMinLen ? 'text-emerald-700 font-semibold' : 'text-[#837D7D]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>8+ Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700 font-semibold' : 'text-[#837D7D]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Uppercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700 font-semibold' : 'text-[#837D7D]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-[#837D7D]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Number</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full btn-muryn-blue justify-center text-sm py-3 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#837D7D]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#2D80FD] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
