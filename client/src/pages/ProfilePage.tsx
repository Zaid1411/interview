import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { updateProfile } from '../api/auth.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Sparkles,
  Camera,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setUser((prev) => (prev ? { ...prev, name: res.user.name, avatarUrl: res.user.avatarUrl } : null));
      toast.success('Profile details updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
          <User className="w-7 h-7 text-brand-600" />
          <span>User Profile & Security</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal developer settings, security credentials, and platform preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <Card className="p-6 text-center space-y-4">
          <div className="relative inline-block mx-auto">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-slate-200 mx-auto"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black uppercase mx-auto">
                {user.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>

          {user.stats && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="block text-slate-400">Solved</span>
                <strong className="text-base text-emerald-600 font-mono">
                  {user.stats.solvedQuestions}
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="block text-slate-400">Mocks</span>
                <strong className="text-base text-slate-800 font-mono">
                  {user.stats.completedInterviews}
                </strong>
              </div>
            </div>
          )}

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={logout}
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </Card>

        {/* Right Column: Edit Profile Form & Security */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                icon={<User className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Avatar URL (Optional)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                icon={<Camera className="w-4 h-4 text-slate-400" />}
                hint="Provide a direct image URL for your profile avatar."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
                  />
                  <Shield className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Email changes require security verification.
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 space-y-3 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Security & Session Token Protection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your authentication session is safeguarded with strict HTTP-only cookies and cryptographically signed JWT tokens. Plaintext credentials or tokens are never exposed to browser storage.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
