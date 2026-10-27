import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQuestionDetail } from '../api/questions.js';
import { runCode, submitSolution, saveDraft, fetchQuestionSubmissions, ExecutionResponse } from '../api/submissions.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
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
  BookOpen,
  Lightbulb,
  History,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

export const CodingWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'hints' | 'editorial' | 'submissions'>('description');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);

  // Fetch question details
  const { data: qData, isLoading, error } = useQuery({
    queryKey: ['question', slug],
    queryFn: () => fetchQuestionDetail(slug!),
    enabled: !!slug,
  });

  const question = qData?.data;

  // Track code draft per language
  const codeByLangRef = useRef<Record<string, string>>({});

  // Initialize starter code or loaded draft per language
  useEffect(() => {
    if (question) {
      if (!codeByLangRef.current[language]) {
        const starter = (question.starterCode as Record<string, string>)?.[language] || '';
        // If there's a saved draft and language is javascript (default), load draft
        codeByLangRef.current[language] =
          question.savedDraft && language === 'javascript'
            ? question.savedDraft
            : starter;
      }
      setCode(codeByLangRef.current[language]);
    }
  }, [question, language]);

  // Debounced auto-save draft
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || '';
    setCode(val);
    codeByLangRef.current[language] = val;

    if (user && question) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft({
          questionId: question.id,
          language,
          code: val,
        }).catch(() => {});
      }, 1500);
    }
  };

  // Run Code Mutation
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
        toast.success(`Passed all ${res.passedTests} sample test cases!`);
      } else {
        toast.warning(`${res.passedTests} of ${res.totalTests} sample test cases passed.`);
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
        error: err.message || 'Execution failed',
        provider: 'Isolated Runner',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution Mutation
  const handleSubmitSolution = async () => {
    if (!question) return;
    if (!user) {
      toast.info('Please sign in to submit solutions and track progress.');
      return;
    }

    setIsSubmitting(true);
    setExecutionResult(null);

    try {
      const res = await submitSolution({
        questionId: question.id,
        language,
        code,
      });
      setExecutionResult(res);

      if (res.success) {
        toast.success(`Accepted! Problem marked as solved.`);
        queryClient.invalidateQueries({ queryKey: ['question', slug] });
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      } else {
        toast.error(`Solution failed on test cases: ${res.status}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Submission error');
      setExecutionResult({
        action: 'SUBMIT_SOLUTION',
        success: false,
        status: 'RUNTIME_ERROR',
        passedTests: 0,
        totalTests: question.totalTestCases || question.testCases.length,
        testResults: [],
        error: err.message || 'Submission failed',
        provider: 'Isolated Runner',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStarter = () => {
    if (question) {
      const starter = (question.starterCode as Record<string, string>)?.[language] || '';
      setCode(starter);
      codeByLangRef.current[language] = starter;
      setIsResetConfirmOpen(false);
      toast.info('Code reset to original starter template.');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading coding workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Question not found</h2>
        <p className="text-sm text-slate-500">The requested problem does not exist or was moved.</p>
        <Link to="/questions">
          <Button variant="primary">Return to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#07080b]">
      {/* Top Workspace Header Bar */}
      <div className="h-14 border-b border-[#1E2538] bg-[#0c0e17] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/questions"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/10"
            title="Back to Questions"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
              {question.title}
            </h1>
            <DifficultyBadge difficulty={question.difficulty} />
            {question.isSolved && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Solved
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <LanguageSelector
            language={language}
            onChange={(newLang) => setLanguage(newLang)}
          />

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 transition border border-white/10"
            title="Reset code to starter template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

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
            className="px-5 py-2 rounded-full bg-[#2D80FD] hover:bg-[#1A6FEF] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Panel: Problem Statement / Tabs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col border-r border-[#1E2538] bg-[#0c101a] text-slate-300 overflow-hidden">
          {/* Tab buttons */}
          <div className="flex items-center border-b border-[#1E2538] bg-[#0f1422] text-xs px-2 shrink-0">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`flex items-center gap-1.5 py-3 px-3.5 font-semibold text-xs border-b-2 transition ${
                activeLeftTab === 'description'
                  ? 'border-[#2D80FD] text-[#2D80FD]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`flex items-center gap-1.5 py-3 px-3.5 font-semibold text-xs border-b-2 transition ${
                activeLeftTab === 'hints'
                  ? 'border-[#2D80FD] text-[#2D80FD]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hints ({question.hints.length})</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('editorial')}
              className={`flex items-center gap-1.5 py-3 px-3.5 font-semibold text-xs border-b-2 transition ${
                activeLeftTab === 'editorial'
                  ? 'border-[#2D80FD] text-[#2D80FD]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Editorial</span>
            </button>
          </div>

          {/* Left panel scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 dark-scroll text-sm leading-relaxed">
            {activeLeftTab === 'description' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white">{question.title}</h2>
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={question.difficulty} />
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{question.topics.join(', ')}</span>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {question.description}
                </div>

                {/* Input & Output Format */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5 uppercase tracking-wide">
                      Input Format
                    </span>
                    <p className="text-slate-300">{question.inputFormat}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-400 block mb-0.5 uppercase tracking-wide">
                      Output Format
                    </span>
                    <p className="text-slate-300">{question.outputFormat}</p>
                  </div>
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Examples
                  </h4>
                  {question.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono text-xs"
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
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Constraints
                  </h4>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300/90 whitespace-pre-wrap">
                    {question.constraints}
                  </pre>
                </div>
              </div>
            )}

            {activeLeftTab === 'hints' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Progressive Problem Hints
                </h3>
                {question.hints.map((hint, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                      Hint {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{hint}</p>
                  </div>
                ))}
              </div>
            )}

            {activeLeftTab === 'editorial' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Official Editorial & Complexity Breakdown
                </h3>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {question.editorial}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Monaco Editor & Test Results (7 cols) */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden bg-[#0f172a]">
          {/* Top Monaco Code Editor (Flex 1) */}
          <div className="flex-1 min-h-[300px] overflow-hidden relative">
            <MonacoCodeEditor
              language={language}
              code={code}
              onChange={handleCodeChange}
            />
          </div>

          {/* Bottom Test Case Results Panel */}
          <div className="h-[240px] shrink-0 overflow-y-auto dark-scroll">
            <TestResultCard
              result={executionResult}
              isRunning={isRunning || isSubmitting}
              sampleTestCases={question.testCases}
            />
          </div>
        </div>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetStarter}
        title="Reset Code?"
        message="This will overwrite your current code with the original starter template for this problem."
        confirmLabel="Reset Code"
        variant="danger"
      />
    </div>
  );
};
