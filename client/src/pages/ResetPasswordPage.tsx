import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth.js';
import { useToast } from '../context/ToastContext.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Code2, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const navigate = useNavigate();

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const matches = password === confirmPassword && password.length > 0;
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('A valid reset token is required.');
      return;
    }
    if (!isPasswordValid) {
      setError('Please satisfy all password complexity rules.');
      return;
    }
    if (!matches) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({ token, password });
      toast.success('Your password has been reset! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Token may be invalid or expired.');
      toast.error(err.message || 'Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/questions" className="inline-flex items-center gap-2 group py-1 mb-2">
            <span className="text-3xl font-extrabold tracking-[-0.04em] text-[#181212] group-hover:text-[#2D80FD] transition-colors leading-none select-none">
              Interview<span className="text-[#2D80FD]">Lab</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Set a new password
          </h1>
          <p className="text-sm text-slate-500">
            Ensure your account is protected with a strong, distinct password.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!tokenFromUrl && (
              <Input
                label="Reset Token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from reset email"
                required
              />
            )}

            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
              <span className="font-semibold text-slate-700 block mb-1">Password Requirements:</span>
              <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                <div className={`flex items-center gap-1.5 ${hasMinLen ? 'text-emerald-700 font-medium' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLen ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700 font-medium' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Uppercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700 font-medium' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasLower ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1+ digit</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              isLoading={isLoading}
              disabled={!token || !isPasswordValid || !matches}
            >
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
