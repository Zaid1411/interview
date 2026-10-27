import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchQuestions, fetchTopics } from '../api/questions.js';
import { DifficultyBadge } from '../components/ui/Badge.js';
import { CardSkeleton } from '../components/ui/Skeleton.js';
import {
  Search,
  CheckCircle2,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Code2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const QuestionLibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const difficulty = searchParams.get('difficulty') || 'All';
  const topic = searchParams.get('topic') || 'All';
  const sortBy = searchParams.get('sortBy') || 'title';
  const order = searchParams.get('order') || 'asc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  // Topics query
  const { data: topicsData } = useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
  });

  // Questions query
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', { search, difficulty, topic, sortBy, order, page }],
    queryFn: () =>
      fetchQuestions({
        search,
        difficulty,
        topic,
        sortBy,
        order,
        page,
        limit: 10,
      }),
  });

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'All') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-10 space-y-8 selection:bg-[#2D80FD]/20 selection:text-[#181212]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#181212]">
            Question Library
          </h1>
          <p className="text-sm text-[#837D7D] mt-1 font-normal">
            {data?.pagination.total ?? 18} algorithmic modules across {topicsData?.topics.length ?? 9} foundational computer science domains
          </p>
        </div>

        <Link to="/interview/setup" className="btn-muryn-blue shrink-0">
          <span>Start Timed Mock</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="sp-card sp-card-white p-6 rounded-[28px] border border-[#EAEAEA] space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#837D7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search problems by title, algorithm, or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF8F8] border border-[#EAEAEA] text-sm text-[#181212] placeholder-[#837D7D] focus:outline-hidden focus:border-[#2D80FD] focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#181212] text-white text-sm font-semibold hover:bg-[#2D80FD] transition shrink-0"
          >
            Search
          </button>
          {(search || difficulty !== 'All' || topic !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchParams({});
              }}
              className="px-5 py-2.5 rounded-full border border-[#EAEAEA] text-[#837D7D] hover:text-[#181212] text-sm font-semibold hover:bg-neutral-50 transition shrink-0"
            >
              Reset Filters
            </button>
          )}
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EAEAEA] text-xs">
          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#837D7D] uppercase tracking-wide">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => updateParam('difficulty', diff)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                  difficulty === diff
                    ? 'bg-[#181212] text-white'
                    : 'bg-[#FAF8F8] text-[#837D7D] hover:text-[#181212] border border-[#EAEAEA]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <span className="text-[#EAEAEA] hidden sm:inline">|</span>

          {/* Topic selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#837D7D] uppercase tracking-wide">Topic:</span>
            <select
              value={topic}
              onChange={(e) => updateParam('topic', e.target.value)}
              className="px-3 py-1.5 rounded-full bg-[#FAF8F8] border border-[#EAEAEA] text-xs font-semibold text-[#181212] focus:ring-1 focus:ring-[#2D80FD] focus:outline-hidden"
            >
              <option value="All">All Topics ({topicsData?.topics.length || 0})</option>
              {topicsData?.topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#EAEAEA] hidden sm:inline">|</span>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 sm:ml-auto">
            <span className="font-semibold text-[#837D7D] uppercase tracking-wide">Sort:</span>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                const next = new URLSearchParams(searchParams);
                next.set('sortBy', sb);
                next.set('order', ord);
                setSearchParams(next);
              }}
              className="px-3 py-1.5 rounded-full bg-[#FAF8F8] border border-[#EAEAEA] text-xs font-semibold text-[#181212] focus:ring-1 focus:ring-[#2D80FD] focus:outline-hidden"
            >
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="difficulty-asc">Difficulty</option>
              <option value="createdAt-desc">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="p-8 text-center text-[#837D7D] bg-white rounded-[28px] border border-[#EAEAEA]">
          Failed to load questions. Please check connection.
        </div>
      ) : data?.data.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[28px] border border-[#EAEAEA] space-y-3">
          <Code2 className="w-10 h-10 text-[#837D7D] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#181212]">No questions found</h3>
          <p className="text-xs text-[#837D7D] max-w-sm mx-auto">
            Try adjusting your search criteria or topic filters to find matching problems.
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              setSearchParams({});
            }}
            className="px-4 py-2 rounded-full border border-[#EAEAEA] text-xs font-semibold text-[#181212] hover:bg-neutral-50 transition"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="sp-card sp-card-white rounded-[32px] border border-[#EAEAEA] overflow-hidden">
          <div className="divide-y divide-[#EAEAEA]">
            {data?.data.map((q) => (
              <div
                key={q.id}
                className="p-5 sm:px-7 flex items-center justify-between gap-4 hover:bg-[#FAF8F8] transition group"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="shrink-0 mt-0.5 sm:mt-0">
                    {q.isSolved ? (
                      <span title="Solved">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </span>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#EAEAEA] group-hover:border-[#2D80FD] transition" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/questions/${q.slug}`}
                        className="text-sm font-semibold text-[#181212] group-hover:text-[#2D80FD] transition truncate"
                      >
                        {q.title}
                      </Link>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {q.topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateParam('topic', t);
                          }}
                          title={`Filter by topic: ${t}`}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF8F8] border border-[#EAEAEA] text-[#837D7D] hover:text-[#181212] hover:border-[#2D80FD] hover:bg-white font-mono transition cursor-pointer"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <span className="hidden sm:inline-block text-xs font-mono text-[#837D7D]">
                    {q.submissionCount} submissions
                  </span>
                  <Link to={`/questions/${q.slug}`}>
                    <button className="px-5 py-2 rounded-full bg-[#2D80FD] text-white font-semibold text-xs hover:bg-[#1A6FEF] transition flex items-center gap-1.5 shadow-xs">
                      <span>{q.isSolved ? 'Solve Again' : 'Solve'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {data && data.pagination.totalPages > 1 && (
            <div className="p-4 sm:px-7 border-t border-[#EAEAEA] flex items-center justify-between text-xs text-[#837D7D] bg-[#FAF8F8]">
              <span>
                Page <strong className="text-[#181212]">{data.pagination.page}</strong> of{' '}
                <strong className="text-[#181212]">{data.pagination.totalPages}</strong> (
                {data.pagination.total} problems)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={data.pagination.page <= 1}
                  onClick={() => updateParam('page', String(data.pagination.page - 1))}
                  className="px-3 py-1.5 rounded-full border border-[#EAEAEA] bg-white text-xs font-semibold text-[#181212] hover:bg-neutral-50 disabled:opacity-40 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => updateParam('page', String(data.pagination.page + 1))}
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
