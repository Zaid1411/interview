import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchInterviewHistory } from '../api/interviews.js';
import { Badge } from '../components/ui/Badge.js';
import { CardSkeleton } from '../components/ui/Skeleton.js';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCw,
  ArrowRight,
} from 'lucide-react';

export const InterviewHistoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || 'All';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['interviewHistory', { status, page }],
    queryFn: () => fetchInterviewHistory({ status, page, limit: 10 }),
  });

  const updateStatusFilter = (st: string) => {
    const next = new URLSearchParams(searchParams);
    if (st && st !== 'All') {
      next.set('status', st);
    } else {
      next.delete('status');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 space-y-8 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
            Session Archives
          </h1>
          <p className="text-sm text-[#837D7D] mt-1 font-normal">
            Review past technical interview simulations, deterministic scores, and solution submissions
          </p>
        </div>

        <Link to="/interview/setup" className="btn-muryn-blue shrink-0">
          <span>Start New Interview</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="text-[#837D7D] uppercase tracking-wide mr-1">Status:</span>
        {['All', 'COMPLETED', 'IN_PROGRESS', 'EXPIRED'].map((s) => (
          <button
            key={s}
            onClick={() => updateStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-full transition font-semibold ${
              status === s
                ? 'bg-[#181212] text-white shadow-xs'
                : 'bg-[#FAF8F8] text-[#837D7D] border border-[#EAEAEA] hover:border-[#2D80FD] hover:text-[#181212]'
            }`}
          >
            {s === 'All' ? 'All Sessions' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="p-8 text-center text-[#837D7D] bg-white rounded-[32px] border border-[#EAEAEA]">
          Failed to load interview records.
        </div>
      ) : data?.data.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[32px] border border-[#EAEAEA] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F8] border border-[#EAEAEA] text-[#837D7D] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#181212]">No interview sessions found</h3>
          <p className="text-xs text-[#837D7D] max-w-sm mx-auto">
            Ready to test your algorithmic problem-solving under real clock constraints?
          </p>
          <Link to="/interview/setup" className="inline-block btn-muryn-blue">
            Launch Your First Timed Round &rarr;
          </Link>
        </div>
      ) : (
        <div className="sp-card sp-card-white rounded-[32px] border border-[#EAEAEA] overflow-hidden">
          <div className="divide-y divide-[#EAEAEA]">
            {data?.data.map((session) => (
              <div
                key={session.id}
                className="p-5 sm:px-7 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF8F8] transition"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-semibold text-[#181212] truncate">
                      {session.title}
                    </h3>
                    <Badge
                      variant={
                        session.status === 'COMPLETED'
                          ? 'success'
                          : session.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#837D7D] font-normal flex-wrap">
                    <span>{new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span>{session.durationMinutes} Minutes</span>
                    <span>•</span>
                    <span className="font-semibold text-[#181212]">
                      {session.solvedQuestions} of {session.totalQuestions} Solved
                    </span>
                    <span>•</span>
                    <span>
                      {session.questions.map((q) => q.question?.title).filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-emerald-700">
                      {Math.round(session.score)} pts
                    </div>
                    <span className="text-[10px] text-[#837D7D] uppercase tracking-wider font-semibold">
                      Score
                    </span>
                  </div>

                  {session.status === 'IN_PROGRESS' ? (
                    <Link to={`/interview/room/${session.id}`}>
                      <button className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs">
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Resume Room</span>
                      </button>
                    </Link>
                  ) : (
                    <Link to={`/interview/results/${session.id}`}>
                      <button className="px-4 py-2 rounded-full border border-[#EAEAEA] bg-white hover:bg-neutral-50 text-[#181212] font-semibold text-xs transition">
                        View Results &rarr;
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="p-4 sm:px-7 border-t border-[#EAEAEA] flex items-center justify-between text-xs text-[#837D7D] bg-[#FAF8F8]">
              <span>
                Page <strong className="text-[#181212]">{data.pagination.page}</strong> of{' '}
                <strong className="text-[#181212]">{data.pagination.totalPages}</strong> ({data.pagination.total} sessions)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={data.pagination.page <= 1}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(data.pagination.page - 1));
                    setSearchParams(next);
                  }}
                  className="px-3 py-1.5 rounded-full border border-[#EAEAEA] bg-white text-xs font-semibold text-[#181212] hover:bg-neutral-50 disabled:opacity-40 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(data.pagination.page + 1));
                    setSearchParams(next);
                  }}
                  className="px-3 py-1.5 rounded-full border border-[#EAEAEA] bg-white text-xs font-semibold text-[#181212] hover:bg-neutral-50 disabled:opacity-40 transition flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
