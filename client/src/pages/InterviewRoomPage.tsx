import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInterviewSession, finishInterviewSession } from '../api/interviews.js';
import { runCode, submitSolution, saveDraft, ExecutionResponse } from '../api/submissions.js';
import { useToast } from '../context/ToastContext.js';
import { InterviewTimer } from '../components/interview/InterviewTimer.js';
import { QuestionNavigator } from '../components/interview/QuestionNavigator.js';
import { MonacoCodeEditor } from '../components/editor/MonacoCodeEditor.js';
import { LanguageSelector } from '../components/editor/LanguageSelector.js';
import { TestResultCard } from '../components/editor/TestResultCard.js';
import { DifficultyBadge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  FileText,
  Lightbulb,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';

export const InterviewRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'hints'>('description');
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Fetch Session Details
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['interviewRoom', id],
    queryFn: () => fetchInterviewSession(id!),
    enabled: !!id,
    refetchInterval: false,
  });

  const session = data?.session;
  const currentAssignedQuestion = session?.questions[currentQuestionIndex];
  const question = currentAssignedQuestion?.question;

  // Track draft per question in state
  const draftsRef = useRef<Record<string, string>>({});

  // When switching questions or session loaded, update code
  useEffect(() => {
    if (session && question) {
      const key = `${question.id}_${language}`;
      // Check local draft first, then session draft, then starter code
      const existingDraft = draftsRef.current[key] || session.drafts?.[key];
      if (existingDraft) {
        setCode(existingDraft);
      } else {
        const starter = question.starterCode?.[language] || '';
        setCode(starter);
      }
      setExecutionResult(null);
    }
  }, [currentQuestionIndex, question, session, language]);

  // Debounced auto-save draft
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || '';
    setCode(val);

    if (question && session) {
      const key = `${question.id}_${language}`;
      draftsRef.current[key] = val;

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft({
          questionId: question.id,
          interviewSessionId: session.id,
          language,
          code: val,
        }).catch(() => {});
      }, 1500);
    }
  };

  // Run Code
  const handleRunCode = async () => {
    if (!question) return;
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const res = await runCode({
        questionId: question.id,
        language,
        code,
      });
      setExecutionResult(res);
      if (res.success) {
        toast.success(`Sample tests passed (${res.passedTests}/${res.totalTests})`);
      } else {
        toast.warning(`${res.passedTests}/${res.totalTests} sample tests passed.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Execution error');
      setExecutionResult({
        action: 'RUN_CODE',
        success: false,
        status: 'RUNTIME_ERROR',
        passedTests: 0,
        totalTests: question.testCases.length,
        testResults: [],
        error: err.message,
        provider: 'Isolated Runner',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution within Interview
  const handleSubmitSolution = async () => {
    if (!question || !session) return;
    setIsSubmitting(true);
    setExecutionResult(null);

    try {
      const res = await submitSolution({
        questionId: question.id,
        interviewSessionId: session.id,
        language,
        code,
      });
      setExecutionResult(res);

      if (res.success) {
        toast.success(`Question ${currentQuestionIndex + 1} Accepted! Passed all test suites.`);
        refetch(); // Refetch session to update isSolved checkmark
      } else {
        toast.error(`Submission did not pass full test suite: ${res.status}`);
      }
    } catch (err: any) {
      if (err.statusCode === 403) {
        toast.error('Interview has expired. Submissions are no longer accepted.');
        navigate(`/interview/results/${session.id}`);
      } else {
        toast.error(err.message || 'Submission error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finish Interview
  const handleFinishInterview = async () => {
    if (!session) return;
    setIsFinishConfirmOpen(false);

    try {
      await finishInterviewSession(session.id);
      toast.success('Interview submitted! Reviewing final performance score...');
      navigate(`/interview/results/${session.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete interview.');
      navigate(`/interview/results/${session.id}`);
    }
  };

  // Auto-finish on Timer Expiry
  const handleTimerExpire = useCallback(async () => {
    if (!session) return;
    toast.warning('Time has expired! Submitting interview room automatically...');
    try {
      await finishInterviewSession(session.id);
    } finally {
      navigate(`/interview/results/${session.id}`);
    }
  }, [session, navigate, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Entering secure interview room...</span>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Session not found</h2>
        <p className="text-sm text-slate-500">The requested interview room was not found or has concluded.</p>
        <Link to="/interview/setup">
          <Button variant="primary">Start a New Mock</Button>
        </Link>
      </div>
    );
  }

  // If session is already completed or expired, redirect to results
  if (session.status === 'COMPLETED' || session.status === 'EXPIRED') {
    navigate(`/interview/results/${session.id}`, { replace: true });
    return null;
  }

  const solvedCount = session.questions.filter((q) => q.isSolved).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#07080b]">
      {/* Top Interview Cockpit Header */}
      <div className="h-14 border-b border-white/10 bg-[#0b0e17] px-4 flex items-center justify-between shrink-0">
        {/* Left: Questions Navigator */}
        <div className="flex items-center gap-3">
          <QuestionNavigator
            questions={session.questions}
            currentIndex={currentQuestionIndex}
            onSelect={(idx) => setCurrentQuestionIndex(idx)}
          />
        </div>

        {/* Center: Server-Authoritative Timer */}
        <div className="flex items-center gap-3">
          <InterviewTimer
            expiresAt={session.expiresAt}
            totalDurationMinutes={session.durationMinutes}
            onExpire={handleTimerExpire}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <LanguageSelector
            language={language}
            onChange={(newLang) => setLanguage(newLang)}
          />

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 border border-slate-700"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 rounded-full bg-[#2D80FD] hover:bg-[#1A6FEF] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>

          <button
            onClick={() => setIsFinishConfirmOpen(true)}
            className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition flex items-center gap-1.5 ml-1 shadow-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Finish Interview</span>
          </button>
        </div>
      </div>

      {/* Main Split Panels */}
      {question && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Problem Statement / Hints (5 cols) */}
          <div className="lg:col-span-5 flex flex-col border-r border-slate-800 bg-[#0d1117] text-slate-300 overflow-hidden">
            <div className="flex items-center border-b border-slate-800 bg-slate-900/70 text-xs px-2 shrink-0">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex items-center gap-1.5 py-2.5 px-3 font-semibold border-b-2 transition ${
                  activeTab === 'description'
                    ? 'border-[#2D80FD] text-[#2D80FD]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Problem Statement</span>
              </button>

              <button
                onClick={() => setActiveTab('hints')}
                className={`flex items-center gap-1.5 py-2.5 px-3 font-semibold border-b-2 transition ${
                  activeTab === 'hints'
                    ? 'border-[#2D80FD] text-[#2D80FD]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Hints ({question.hints.length})</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 dark-scroll text-sm leading-relaxed">
              {activeTab === 'description' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-brand-400 uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {session.totalQuestions}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-1">{question.title}</h2>
                    </div>
                    <DifficultyBadge difficulty={question.difficulty} />
                  </div>

                  <div className="text-slate-300 whitespace-pre-line font-sans leading-relaxed">
                    {question.description}
                  </div>

                  {/* Input / Output Specs */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-400 block uppercase">Input / Output Format</span>
                    <p className="text-slate-300">{question.inputFormat}</p>
                    <p className="text-slate-300">{question.outputFormat}</p>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Examples</h4>
                    {question.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono text-xs"
                      >
                        <div className="font-bold text-slate-300 font-sans">Example {i + 1}:</div>
                        <div>
                          <span className="text-slate-500 font-sans">Input: </span>
                          <span className="text-slate-200">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-sans">Output: </span>
                          <span className="text-emerald-400 font-bold">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="pt-1 text-slate-400 font-sans text-[11px]">
                            <span className="text-slate-500">Explanation: </span>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Constraints</h4>
                    <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300/90 whitespace-pre-wrap">
                      {question.constraints}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Interview Guidance Hints
                  </h3>
                  {question.hints.map((hint, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                        Hint {idx + 1}
                      </span>
                      <p className="text-xs text-slate-300">{hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Code Editor & Test Results (7 cols) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden bg-[#0f172a]">
            <div className="flex-1 min-h-[300px] overflow-hidden relative">
              <MonacoCodeEditor
                language={language}
                code={code}
                onChange={handleCodeChange}
              />
            </div>

            <div className="h-[240px] shrink-0 overflow-y-auto dark-scroll">
              <TestResultCard
                result={executionResult}
                isRunning={isRunning || isSubmitting}
                sampleTestCases={question.testCases}
              />
            </div>
          </div>
        </div>
      )}

      {/* Finish Interview Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isFinishConfirmOpen}
        onClose={() => setIsFinishConfirmOpen(false)}
        onConfirm={handleFinishInterview}
        title="Conclude Interview Session?"
        message={`You have solved ${solvedCount} of ${session.totalQuestions} questions. Are you sure you want to finish and submit your interview for automated scoring?`}
        confirmLabel="Finish & View Results"
        cancelLabel="Continue Practicing"
        variant="primary"
      />
    </div>
  );
};
