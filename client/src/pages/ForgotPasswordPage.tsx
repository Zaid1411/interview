import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Code2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await forgotPassword({ email });
      setSubmitted(true);
      if (res.resetToken) {
        setDevToken(res.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset instructions.');
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
            Reset your password
          </h1>
          <p className="text-sm text-slate-500">
            Enter your account email and we&apos;ll send you a secure password reset link.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
              <p className="text-sm text-slate-600">
                If an account exists for <strong className="text-slate-800">{email}</strong>, we have dispatched instructions to reset your password.
              </p>
              {devToken && (
                <div className="p-3 bg-slate-100 rounded-lg text-left text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Development Reset Token:</span>
                  <code className="text-brand-700 break-all select-all">{devToken}</code>
                  <div className="pt-2">
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="text-brand-600 font-semibold hover:underline block"
                    >
                      Click here to complete password reset &rarr;
                    </Link>
                  </div>
                </div>
              )}
              <Link to="/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                icon={<Mail className="w-4 h-4" />}
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
