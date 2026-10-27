import { apiClient } from './client.js';

export interface TestResultItem {
  id: string;
  orderIndex: number;
  passed: boolean;
  actual?: string;
  expected?: string;
  input?: string;
  isHidden: boolean;
  executionTimeMs?: number;
  error?: string;
}

export interface ExecutionResponse {
  action: 'RUN_CODE' | 'SUBMIT_SOLUTION';
  submissionId?: string;
  success: boolean;
  status: 'PASSED' | 'FAILED' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'COMPILE_ERROR';
  passedTests: number;
  totalTests: number;
  testResults: TestResultItem[];
  executionTimeMs?: number;
  consoleOutput?: string;
  error?: string;
  provider: string;
  isSolved?: boolean;
}

export interface SubmissionHistoryItem {
  id: string;
  language: string;
  status: string;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number | null;
  createdAt: string;
  code: string;
}

export async function runCode(payload: {
  questionId: string;
  language: 'javascript' | 'python';
  code: string;
}): Promise<ExecutionResponse> {
  return apiClient<ExecutionResponse>('/submissions/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitSolution(payload: {
  questionId: string;
  language: 'javascript' | 'python';
  code: string;
  interviewSessionId?: string;
}): Promise<ExecutionResponse> {
  return apiClient<ExecutionResponse>('/submissions/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function saveDraft(payload: {
  questionId: string;
  language: 'javascript' | 'python';
  code: string;
  interviewSessionId?: string;
}): Promise<{ message: string; updatedAt: string }> {
  return apiClient<{ message: string; updatedAt: string }>('/submissions/draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchQuestionSubmissions(
  questionId: string
): Promise<{ data: SubmissionHistoryItem[] }> {
  return apiClient<{ data: SubmissionHistoryItem[] }>(`/submissions/question/${questionId}`);
}
