import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createInterviewSession, fetchActiveInterview } from '../api/interviews.js';
import { fetchTopics } from '../api/questions.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Clock,
  Play,
  RotateCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [duration, setDuration] = useState<'15' | '30' | '45' | '60'>('30');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Mixed');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [isCurated, setIsCurated] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  // Check if an active interview already exists
  const { data: activeData, isLoading: checkingActive } = useQuery({
    queryKey: ['activeInterview'],
    queryFn: fetchActiveInterview,
    enabled: !!user,
  });

  // Fetch available topics
  const { data: topicsData } = useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
  });

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in or create an account to start an interview session.');
      navigate('/login');
      return;
    }

    setIsStarting(true);
    try {
      const res = await createInterviewSession({
        title: title.trim() || undefined,
        durationMinutes: duration,
        difficulty,
        topics: selectedTopics,
        curated: isCurated,
      });

      toast.success('Interview session initialized! Good luck.');
      navigate(`/interview/room/${res.session.id}`);
    } catch (err: any) {
      if (err.statusCode === 409 && err.details?.activeSessionId) {
        toast.warning('Resuming existing active session.');
        navigate(`/interview/room/${err.details.activeSessionId}`);
      } else {
        toast.error(err.message || 'Failed to start interview session.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const activeSession = activeData?.session;

  return (
    <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-10 space-y-8 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      {/* Header */}
      <div className="space-y-2 border-b border-[#EAEAEA] pb-6">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
          Setup Timed Interview
        </h1>
        <p className="text-sm text-[#837D7D]">
          Simulate an authentic screening round with Monaco code editing, isolated sandboxes, and automated evaluation.
        </p>
      </div>

      {/* Active Session Alert if exists */}
      {activeSession && (
        <div className="p-5 rounded-[28px] bg-[#FFF8E7] border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <RotateCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                You have an active interview session in progress!
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                {activeSession.title} • {activeSession.durationMinutes} min session
              </p>
            </div>
          </div>
          <Link
            to={`/interview/room/${activeSession.id}`}
            className="btn-muryn-blue shrink-0 text-xs py-2 px-5"
          >
            Resume Active Room &rarr;
          </Link>
        </div>
      )}

      {/* Setup Form */}
      <form onSubmit={handleStartInterview} className="space-y-6">
        <div className="sp-card sp-card-white p-8 sm:p-10 rounded-[36px] border border-[#EAEAEA] space-y-7">
          {/* Custom Title (Optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#837D7D] uppercase tracking-wider">
              Session Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Google Screening Sprint, Core Algorithms Mock"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F8] border border-[#EAEAEA] text-sm text-[#181212] focus:outline-hidden focus:border-[#2D80FD] focus:bg-white transition"
            />
          </div>

          {/* Duration Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#837D7D] uppercase tracking-wider">
              Interview Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: '15', label: '15 Mins', desc: '1 Question • Fast screening' },
                { val: '30', label: '30 Mins', desc: '2 Questions • Standard round' },
                { val: '45', label: '45 Mins', desc: '3 Questions • Deep algorithm' },
                { val: '60', label: '60 Mins', desc: '4 Questions • Full loop' },
              ].map((d) => {
                const isSelected = duration === d.val;
                return (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => setDuration(d.val as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#2D80FD] bg-[#EDF5FF] text-[#181212] shadow-xs'
                        : 'border-[#EAEAEA] bg-[#FAF8F8] text-[#837D7D] hover:border-[#D5D5D5]'
                    }`}
                  >
                    <div className={`font-semibold text-sm ${isSelected ? 'text-[#2D80FD]' : 'text-[#181212]'}`}>
                      {d.label}
                    </div>
                    <div className="text-[11px] mt-1 font-mono text-[#837D7D]">
                      {d.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#837D7D] uppercase tracking-wider">
              Target Difficulty
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: 'Easy', label: 'Easy' },
                { val: 'Medium', label: 'Medium' },
                { val: 'Hard', label: 'Hard' },
                { val: 'Mixed', label: 'Mixed' },
              ].map((diff) => {
                const isSelected = difficulty === diff.val;
                return (
                  <button
                    key={diff.val}
                    type="button"
                    onClick={() => setDifficulty(diff.val as any)}
                    className={`py-3 px-4 rounded-2xl border text-center font-semibold text-sm transition-all ${
                      isSelected
                        ? 'border-[#2D80FD] bg-[#EDF5FF] text-[#2D80FD] shadow-xs'
                        : 'border-[#EAEAEA] bg-[#FAF8F8] text-[#837D7D] hover:border-[#D5D5D5]'
                    }`}
                  >
                    {diff.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Focus */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#837D7D] uppercase tracking-wider">
                Target Topics ({selectedTopics.length === 0 ? 'All Topics' : `${selectedTopics.length} selected`})
              </label>
              {selectedTopics.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTopics([])}
                  className="text-xs text-[#2D80FD] hover:underline font-semibold"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {topicsData?.topics.map((t) => {
                const isSelected = selectedTopics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-[#2D80FD] text-white shadow-xs'
                        : 'bg-[#FAF8F8] text-[#837D7D] border border-[#EAEAEA] hover:border-[#2D80FD] hover:text-[#181212]'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated Question Set Toggle */}
          <div className="pt-4 border-t border-[#EAEAEA] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#181212] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2D80FD]" />
                Curated Question Sequencing
              </span>
              <p className="text-[11px] text-[#837D7D]">
                Order questions progressively from warm-up to core algorithmic challenges.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isCurated}
              onChange={(e) => setIsCurated(e.target.checked)}
              className="w-4 h-4 text-[#2D80FD] rounded border-[#EAEAEA] focus:ring-[#2D80FD]"
            />
          </div>
        </div>

        {/* Start Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-[28px] bg-[#FAF8F8] border border-[#EAEAEA]">
          <div className="text-xs text-[#837D7D] text-center sm:text-left font-mono">
            Timer starts immediately upon entering the room. Submissions are server-authoritative.
          </div>
          <button
            type="submit"
            disabled={checkingActive || !!activeSession || isStarting}
            className="w-full sm:w-auto btn-muryn-blue justify-center text-sm disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isStarting ? 'Initializing Room...' : 'Enter Timed Interview Room'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
