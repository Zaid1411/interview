import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDetailedAnalytics, fetchDashboardData } from '../api/analytics.js';
import { CardSkeleton } from '../components/ui/Skeleton.js';
import {
  TrendingUp,
  Cpu,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { data: detailedData, isLoading: loadingDetailed } = useQuery({
    queryKey: ['detailedAnalytics'],
    queryFn: fetchDetailedAnalytics,
  });

  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });

  if (loadingDetailed || loadingDashboard) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const { solvedOverTime, languageStats, difficultyStats } = detailedData!;
  const { topicPerformance, metrics } = dashboardData!;

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 space-y-8 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      {/* Header */}
      <div className="pb-6 border-b border-[#EAEAEA] flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
            Analytics & Progress
          </h1>
          <p className="text-sm text-[#837D7D] mt-1 font-normal">
            Trajectory, language distribution, and topic mastery curve computed live from PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#181212] bg-[#FAF8F8] border border-[#EAEAEA] px-4 py-2 rounded-full">
            {metrics.totalSolved} Problems Solved
          </span>
        </div>
      </div>

      {/* Questions Solved Over Time (30-Day Trend Area Chart) */}
      <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#181212] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2D80FD]" />
              Cumulative Questions Solved (30-Day Velocity)
            </h3>
            <p className="text-xs text-[#837D7D] mt-0.5">
              Tracks continuous problem-solving velocity and milestone completions
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#2D80FD] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Velocity Trend
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={solvedOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D80FD" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2D80FD" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#837D7D' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#837D7D' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #EAEAEA',
                  color: '#181212',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeSolved"
                name="Total Solved"
                stroke="#2D80FD"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorBlue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Difficulty Breakdown & Language Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Difficulty Distribution */}
        <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA] space-y-5">
          <div>
            <h3 className="text-base font-semibold text-[#181212] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2D80FD]" />
              Difficulty Distribution
            </h3>
            <p className="text-xs text-[#837D7D] mt-0.5">
              Problems solved by algorithmic difficulty level
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(difficultyStats).map(([diff, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;
              const color =
                diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-[#2D80FD]' : 'bg-[#E0465C]';

              return (
                <div key={diff} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#181212]">{diff}</span>
                    <span className="font-mono text-[#837D7D]">
                      {stats.solved} / {stats.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FAF8F8] rounded-full overflow-hidden border border-[#EAEAEA]">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language Utilization */}
        <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA] space-y-5">
          <div>
            <h3 className="text-base font-semibold text-[#181212] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#2D80FD]" />
              Programming Language Breakdown
            </h3>
            <p className="text-xs text-[#837D7D] mt-0.5">
              Submissions and pass rate per supported programming language
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(languageStats).map(([lang, stats]) => {
              const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
              const langName = lang === 'javascript' ? 'JavaScript (Node 18)' : 'Python (3.10)';

              return (
                <div key={lang} className="p-4 rounded-2xl bg-[#FAF8F8] border border-[#EAEAEA] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#181212]">{langName}</span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {passRate}% Pass Rate
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#837D7D] font-mono">
                    <span>Total Runs: {stats.total}</span>
                    <span>Passed: {stats.passed}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Topic Accuracy & Proficiency Table */}
      <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#181212] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#2D80FD]" />
            Topic-Wise Algorithmic Accuracy
          </h3>
          <p className="text-xs text-[#837D7D] mt-0.5">
            Success rates and completion ratios across all 9 core interview topics
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F8] text-[#837D7D] uppercase tracking-wider font-semibold border-b border-[#EAEAEA]">
              <tr>
                <th className="py-3 px-3">Topic</th>
                <th className="py-3 px-3">Available</th>
                <th className="py-3 px-3">Solved</th>
                <th className="py-3 px-3">Attempted</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {topicPerformance.map((tp) => (
                <tr key={tp.topic} className="hover:bg-[#FAF8F8] transition">
                  <td className="py-3 px-3 font-semibold text-[#181212]">{tp.topic}</td>
                  <td className="py-3 px-3 font-mono text-[#837D7D]">{tp.total}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-emerald-700">{tp.solved}</td>
                  <td className="py-3 px-3 font-mono text-[#837D7D]">{tp.attempted}</td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`font-semibold ${
                        tp.accuracy >= 80
                          ? 'text-emerald-700'
                          : tp.accuracy >= 50
                          ? 'text-amber-700'
                          : 'text-[#837D7D]'
                      }`}
                    >
                      {tp.attempted > 0 ? `${tp.accuracy}%` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#FAF8F8] rounded-full overflow-hidden border border-[#EAEAEA]">
                        <div
                          className="h-full bg-[#2D80FD] rounded-full"
                          style={{ width: `${tp.completionRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#837D7D] text-[11px]">{tp.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
