import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../api/analytics.js';
import { useAuth } from '../context/AuthContext.js';
import { DifficultyBadge } from '../components/ui/Badge.js';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton.js';
import {
  CheckCircle2,
  Flame,
  Clock,
  Code2,
  TrendingUp,
  Sparkles,
  Layers,
  Play,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64 bg-neutral-100" />
          <Skeleton className="h-10 w-36 bg-neutral-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-[#181212]">Failed to load dashboard data</h2>
        <p className="text-xs text-[#837D7D]">{(error as any)?.message || 'Database error'}</p>
        <button
          onClick={() => refetch()}
          className="btn-muryn-blue text-xs py-2 px-6"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, weeklyActivity, topicPerformance, recentSessions, recommendedQuestions } = data;

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 space-y-8 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      {/* Welcome & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-[#837D7D] mt-1 font-normal">
            Track your interview trajectory, metrics, and targeted practice
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/questions"
            className="px-5 py-2.5 rounded-full border border-[#EAEAEA] text-xs font-semibold text-[#181212] hover:bg-neutral-50 transition flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Problem Library</span>
          </Link>
          <Link to="/interview/setup" className="btn-muryn-blue text-xs py-2.5 px-5">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Mock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Questions Solved */}
        <div className="sp-card sp-card-white p-6 rounded-[28px] border border-[#EAEAEA] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Solved</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#181212] font-mono">
              {metrics.totalSolved}
            </div>
            <p className="text-xs text-[#837D7D] mt-1">
              Out of <span className="font-semibold text-[#181212]">{metrics.totalAttempted}</span> attempted
            </p>
          </div>
        </div>

        {/* Practice Streak */}
        <div className="sp-card sp-card-white p-6 rounded-[28px] border border-[#EAEAEA] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Streak</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#181212] font-mono flex items-baseline gap-1.5">
              <span>{metrics.currentStreak}</span>
              <span className="text-xs font-sans font-normal text-[#837D7D]">days</span>
            </div>
            <p className="text-xs text-[#837D7D] mt-1">
              {metrics.currentStreak > 0 ? 'Consecutive daily activity' : 'Solve a problem to start'}
            </p>
          </div>
        </div>

        {/* Avg Runtime */}
        <div className="sp-card sp-card-white p-6 rounded-[28px] border border-[#EAEAEA] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Avg Runtime</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2D80FD] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#181212] font-mono flex items-baseline gap-1.5">
              <span>{metrics.avgExecutionTimeMs}</span>
              <span className="text-xs font-sans font-normal text-[#837D7D]">ms</span>
            </div>
            <p className="text-xs text-[#837D7D] mt-1">Across validated runs</p>
          </div>
        </div>

        {/* Completed Interviews */}
        <div className="sp-card sp-card-white p-6 rounded-[28px] border border-[#EAEAEA] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Mocks</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#181212] font-mono">
              {recentSessions.length}
            </div>
            <p className="text-xs text-[#837D7D] mt-1">Archived timed rounds</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity Chart (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-[#181212] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2D80FD]" />
                  Weekly Practice Activity
                </h3>
                <p className="text-xs text-[#837D7D] mt-0.5">
                  Submissions and successful problem solves over the past 7 days
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                Live Sync
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#837D7D' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#837D7D' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #EAEAEA',
                      color: '#181212',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="submissions" name="Submissions" fill="#2D80FD" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="solved" name="Solved" fill="#181212" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#EAEAEA] text-xs font-medium text-[#837D7D]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2D80FD]" />
                <span>Total Submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#181212]" />
                <span>Accepted Solves</span>
              </div>
            </div>
          </div>

          {/* Recommended Questions */}
          <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#181212] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2D80FD]" />
                  Recommended Next Challenges
                </h3>
                <p className="text-xs text-[#837D7D] mt-0.5">
                  Targeted questions curated from unattempted topics
                </p>
              </div>
              <Link to="/questions" className="text-xs font-semibold text-[#2D80FD] hover:underline flex items-center">
                View All &rarr;
              </Link>
            </div>

            <div className="divide-y divide-[#EAEAEA]">
              {recommendedQuestions.map((q) => (
                <div key={q.id} className="py-3.5 flex items-center justify-between group hover:bg-[#FAF8F8] -mx-2 px-3 rounded-2xl transition">
                  <div className="space-y-1">
                    <Link
                      to={`/questions/${q.slug}`}
                      className="text-sm font-semibold text-[#181212] group-hover:text-[#2D80FD] transition truncate"
                    >
                      {q.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={q.difficulty} />
                      <span className="text-xs text-[#EAEAEA]">•</span>
                      <span className="text-xs text-[#837D7D]">{q.topics.join(', ')}</span>
                    </div>
                  </div>
                  <Link to={`/questions/${q.slug}`}>
                    <button className="px-4 py-1.5 rounded-full bg-[#FAF8F8] hover:bg-[#2D80FD] hover:text-white border border-[#EAEAEA] text-xs font-semibold text-[#181212] transition">
                      Solve
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Topic Performance & Recent Interview Sessions */}
        <div className="space-y-6">
          {/* Topic-Wise Performance */}
          <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#181212]">Topic Performance</h3>
              <Link to="/analytics" className="text-xs text-[#2D80FD] font-semibold hover:underline">
                Details
              </Link>
            </div>

            <div className="space-y-4">
              {topicPerformance.slice(0, 6).map((tp) => (
                <div key={tp.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#181212]">{tp.topic}</span>
                    <span className="font-mono text-[#837D7D]">
                      {tp.solved} / {tp.total} ({tp.completionRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#FAF8F8] rounded-full overflow-hidden border border-[#EAEAEA]">
                    <div
                      className="h-full bg-[#2D80FD] rounded-full transition-all duration-500"
                      style={{ width: `${tp.completionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Interview Sessions */}
          <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#181212]">Recent Interview Rounds</h3>
              <Link to="/interview/history" className="text-xs text-[#2D80FD] font-semibold hover:underline">
                History
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#837D7D] space-y-3">
                <p>No timed interviews completed yet.</p>
                <Link to="/interview/setup" className="inline-block btn-muryn-blue text-xs py-2 px-5">
                  Launch First Mock
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#EAEAEA]">
                {recentSessions.map((session) => (
                  <div key={session.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/interview/results/${session.id}`}
                        className="text-xs font-semibold text-[#181212] hover:text-[#2D80FD] truncate max-w-[170px]"
                      >
                        {session.title}
                      </Link>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {Math.round(session.score)} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#837D7D]">
                      <span>{session.durationMinutes} min • {session.solvedQuestions}/{session.totalQuestions} solved</span>
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
