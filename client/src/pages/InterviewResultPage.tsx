import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchInterviewResults } from '../api/interviews.js';
import { DifficultyBadge } from '../components/ui/Badge.js';
import { CardSkeleton } from '../components/ui/Skeleton.js';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Info,
  Code2,
  ArrowRight,
} from 'lucide-react';

export const InterviewResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['interviewResults', id],
    queryFn: () => fetchInterviewResults(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-12 space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-[#181212]">Results not found</h2>
        <p className="text-xs text-[#837D7D]">Could not retrieve interview results for this session.</p>
        <Link to="/interview/history" className="inline-block btn-muryn-blue">
          View Interview History
        </Link>
      </div>
    );
  }

  const { session, scoring, timeSpentSeconds, areasForImprovement, submissions } = data;

  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const remainingSeconds = timeSpentSeconds % 60;

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 space-y-8 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      {/* Top Banner / Completion Summary */}
      <div className="sp-card sp-card-white p-8 sm:p-10 rounded-[36px] border border-[#EAEAEA]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2D80FD] text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-[#2D80FD]" />
              <span>Interview Session Concluded</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#181212]">
              {session.title}
            </h1>
            <p className="text-xs text-[#837D7D] leading-relaxed">
              Overall completion summary: Solved{' '}
              <strong className="text-emerald-700 font-mono">{session.solvedQuestions}</strong> of{' '}
              <strong className="text-[#181212] font-mono">{session.totalQuestions}</strong> questions in{' '}
              <strong className="text-[#181212] font-mono">
                {minutesSpent}m {remainingSeconds}s
              </strong>.
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="flex flex-col items-center justify-center bg-[#EDF5FF] text-[#181212] p-6 rounded-[32px] border border-[#D5E5FC] min-w-[170px] text-center shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-[#2D80FD]">
              Evaluated Score
            </span>
            <div className="text-5xl sm:text-6xl font-bold font-mono mt-1 text-[#181212]">
              {scoring.score}
            </div>
            <span className="text-[11px] font-semibold text-[#837D7D] mt-1 font-mono">out of 100 points</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="sp-card sp-card-white p-5 rounded-[28px] border border-[#EAEAEA]">
          <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Completion</span>
          <div className="text-2xl font-bold font-mono text-[#181212] mt-2">
            {scoring.completionRate}%
          </div>
          <p className="text-xs text-[#837D7D] mt-0.5">
            {session.solvedQuestions}/{session.totalQuestions} Solved
          </p>
        </div>

        <div className="sp-card sp-card-white p-5 rounded-[28px] border border-[#EAEAEA]">
          <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Accuracy</span>
          <div className="text-2xl font-bold font-mono text-[#181212] mt-2">
            {scoring.accuracyRate}%
          </div>
          <p className="text-xs text-[#837D7D] mt-0.5">
            {submissions.filter((s: any) => s.status === 'PASSED').length}/{submissions.length} Passed
          </p>
        </div>

        <div className="sp-card sp-card-white p-5 rounded-[28px] border border-[#EAEAEA]">
          <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Time Spent</span>
          <div className="text-2xl font-bold font-mono text-[#181212] mt-2">
            {minutesSpent}m {remainingSeconds}s
          </div>
          <p className="text-xs text-[#837D7D] mt-0.5">
            {session.durationMinutes} min allocated
          </p>
        </div>

        <div className="sp-card sp-card-white p-5 rounded-[28px] border border-[#EAEAEA]">
          <span className="text-xs font-semibold text-[#837D7D] uppercase tracking-wider">Clock Efficiency</span>
          <div className="text-2xl font-bold font-mono text-[#181212] mt-2">
            {scoring.timeEfficiencyRate}%
          </div>
          <p className="text-xs text-[#837D7D] mt-0.5">Remaining buffer</p>
        </div>
      </div>

      {/* Questions Review Section */}
      <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
        <h3 className="text-base font-semibold text-[#181212] mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#2D80FD]" />
          Assigned Questions & Outcomes
        </h3>

        <div className="divide-y divide-[#EAEAEA]">
          {session.questions.map((item, idx) => (
            <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="shrink-0 mt-0.5 sm:mt-0">
                  {item.isSolved ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#837D7D] font-bold">Q{idx + 1}.</span>
                    <h4 className="text-sm font-semibold text-[#181212]">{item.question.title}</h4>
                    <DifficultyBadge difficulty={item.question.difficulty} />
                  </div>
                  <div className="text-xs text-[#837D7D] mt-1 flex items-center gap-2">
                    <span>{item.question.topics.join(', ')}</span>
                    {item.isSolved && (
                      <span className="text-emerald-700 font-semibold font-mono text-[11px]">
                        • Solved on submission
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link to={`/questions/${item.question.slug}`}>
                <button className="px-4 py-1.5 rounded-full border border-[#EAEAEA] bg-white hover:bg-neutral-50 text-xs font-semibold text-[#181212] transition">
                  Review & Editorial &rarr;
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Deterministic Scoring Formula & Assessment Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scoring Rules Breakdown */}
        <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA] space-y-3">
          <div className="flex items-center gap-2 text-[#181212] font-semibold text-sm">
            <BarChart3 className="w-4 h-4 text-[#2D80FD]" />
            <span>Deterministic Scoring Formula</span>
          </div>
          <p className="text-xs text-[#211B1C] leading-relaxed font-mono p-3 bg-[#FAF8F8] rounded-2xl border border-[#EAEAEA]">
            {scoring.formulaExplanation}
          </p>
          <div className="text-xs space-y-1.5 text-[#837D7D]">
            <div className="flex justify-between">
              <span>Base Correctness Points:</span>
              <strong className="text-[#181212]">{scoring.breakdown.basePoints} / 75</strong>
            </div>
            <div className="flex justify-between">
              <span>Time Efficiency Bonus:</span>
              <strong className="text-[#181212]">+{scoring.breakdown.timeBonus} / 15</strong>
            </div>
            <div className="flex justify-between">
              <span>First-Pass Accuracy Bonus:</span>
              <strong className="text-[#181212]">+{scoring.breakdown.accuracyBonus} / 10</strong>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>Failed Attempt Penalties:</span>
              <strong>-{scoring.breakdown.penalties} pts</strong>
            </div>
          </div>
        </div>

        {/* Real-World Interview Disclaimer */}
        <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA] space-y-3">
          <div className="flex items-center gap-2 text-[#181212] font-semibold text-sm">
            <Info className="w-4 h-4 text-[#2D80FD]" />
            <span>Evaluation Scope & Recommendations</span>
          </div>
          <p className="text-xs text-[#837D7D] leading-relaxed">
            {scoring.disclaimer}
          </p>
          <div className="p-4 bg-[#FAF8F8] rounded-2xl border border-[#EAEAEA] space-y-2 text-xs">
            <span className="font-semibold text-[#181212] block">Areas for Targeted Improvement:</span>
            <ul className="list-disc list-inside space-y-1 text-[#837D7D]">
              {areasForImprovement.map((area, i) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Submissions Log Table */}
      {submissions && submissions.length > 0 && (
        <div className="sp-card sp-card-white p-7 rounded-[32px] border border-[#EAEAEA]">
          <h3 className="text-base font-semibold text-[#181212] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#837D7D]" />
            Session Submission History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F8] text-[#837D7D] uppercase tracking-wider font-semibold border-b border-[#EAEAEA]">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Test Cases</th>
                  <th className="py-2.5 px-3">Execution Time</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {submissions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#FAF8F8] font-mono">
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          s.status === 'PASSED' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#181212] font-sans">{s.language}</td>
                    <td className="py-2.5 px-3 text-[#181212]">
                      {s.passedTests} / {s.totalTests}
                    </td>
                    <td className="py-2.5 px-3 text-[#181212]">
                      {s.executionTimeMs ? `${s.executionTimeMs} ms` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[#837D7D] font-sans">
                      {new Date(s.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EAEAEA]">
        <Link
          to="/interview/history"
          className="px-5 py-2.5 rounded-full border border-[#EAEAEA] text-xs font-semibold text-[#181212] hover:bg-neutral-50 transition"
        >
          View All Interview Archives
        </Link>
        <Link to="/interview/setup" className="btn-muryn-blue">
          <span>Start Another Timed Mock</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
