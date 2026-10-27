import React, { useState } from 'react';
import { ExecutionResponse } from '../../api/submissions.js';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Terminal, Shield } from 'lucide-react';

interface TestResultCardProps {
  result: ExecutionResponse | null;
  isRunning: boolean;
  sampleTestCases: Array<{ input: string; expectedOutput: string; orderIndex: number }>;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({
  result,
  isRunning,
  sampleTestCases,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [viewConsole, setViewConsole] = useState<boolean>(false);

  if (isRunning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-900 text-slate-300 rounded-b-xl border-t border-slate-800">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Running code against test suite in isolated runner...</p>
        <p className="text-xs text-slate-500">Checking edge cases, bounds, and execution constraints.</p>
      </div>
    );
  }

  if (!result) {
    // Default initial state: show sample test cases
    return (
      <div className="bg-[#0f172a] text-slate-300 p-4 border-t border-slate-800 rounded-b-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sample Test Cases ({sampleTestCases.length})
          </span>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {sampleTestCases.map((tc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === idx
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Case {idx + 1}
            </button>
          ))}
        </div>

        {sampleTestCases[activeTab] && (
          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 font-sans block mb-1">Input</span>
              <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto border border-slate-800/80">
                {sampleTestCases[activeTab].input}
              </pre>
            </div>
            <div>
              <span className="text-slate-400 font-sans block mb-1">Expected Output</span>
              <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-400 overflow-x-auto border border-slate-800/80">
                {sampleTestCases[activeTab].expectedOutput}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  }

  const { testResults, passedTests, totalTests, status, action, executionTimeMs, consoleOutput, error } = result;
  const isSubmission = action === 'SUBMIT_SOLUTION';
  const isAllPassed = passedTests === totalTests && totalTests > 0;

  return (
    <div className="bg-[#0f172a] text-slate-300 p-4 border-t border-slate-800 rounded-b-xl">
      {/* Header status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          {isAllPassed ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{isSubmission ? 'Accepted • All Tests Passed' : 'Sample Tests Passed'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>{status === 'TIME_LIMIT_EXCEEDED' ? 'Time Limit Exceeded' : status === 'RUNTIME_ERROR' ? 'Runtime Error' : 'Wrong Answer'}</span>
            </div>
          )}
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {passedTests} / {totalTests} Passed
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          {executionTimeMs !== undefined && (
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {executionTimeMs} ms
            </span>
          )}
          {consoleOutput && (
            <button
              onClick={() => setViewConsole(!viewConsole)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                viewConsole ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-3 h-3" />
              Logs
            </button>
          )}
        </div>
      </div>

      {/* Global compilation or runtime error banner */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-mono whitespace-pre-wrap">
          {error}
        </div>
      )}

      {/* Console output display if toggled */}
      {viewConsole && consoleOutput && (
        <div className="mb-4 p-3 rounded-lg bg-black border border-slate-800 text-slate-300 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-500 mb-2 font-sans text-[11px] uppercase tracking-wider">
            <span>Standard Output (Stdout)</span>
            <button onClick={() => setViewConsole(false)} className="text-slate-400 hover:text-white">Close</button>
          </div>
          <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
        </div>
      )}

      {/* Test cases tabs */}
      {testResults && testResults.length > 0 && (
        <>
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {testResults.map((tr, idx) => (
              <button
                key={tr.id || idx}
                onClick={() => {
                  setActiveTab(idx);
                  setViewConsole(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === idx
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    tr.passed ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                {tr.isHidden && (
                  <span title="Hidden Test Case">
                    <Shield className="w-3 h-3 text-slate-400" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active test case detail */}
          {testResults[activeTab] && (
            <div className="space-y-3 text-xs font-mono">
              {testResults[activeTab].isHidden ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-slate-200 font-sans text-sm">
                      Hidden Server Evaluation Test Case
                    </h5>
                    <p className="text-slate-400 font-sans mt-0.5 text-xs leading-relaxed">
                      Hidden test inputs and expected values are evaluated securely on the isolated server runner to protect test integrity.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                          testResults[activeTab].passed
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                            : 'bg-rose-900/50 text-rose-300 border border-rose-700'
                        }`}
                      >
                        {testResults[activeTab].passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {testResults[activeTab].executionTimeMs && (
                        <span className="text-slate-400 font-sans text-[11px]">
                          {testResults[activeTab].executionTimeMs} ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {testResults[activeTab].input && (
                    <div>
                      <span className="text-slate-400 font-sans block mb-1">Input</span>
                      <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto border border-slate-800/80">
                        {testResults[activeTab].input}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 font-sans block mb-1">Expected Output</span>
                      <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-400 overflow-x-auto border border-slate-800/80">
                        {testResults[activeTab].expected || '—'}
                      </pre>
                    </div>

                    <div>
                      <span className="text-slate-400 font-sans block mb-1">Actual Output</span>
                      <pre
                        className={`p-2.5 rounded-lg bg-slate-950 overflow-x-auto border border-slate-800/80 ${
                          testResults[activeTab].passed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {testResults[activeTab].error
                          ? `Error: ${testResults[activeTab].error}`
                          : testResults[activeTab].actual || 'undefined'}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
