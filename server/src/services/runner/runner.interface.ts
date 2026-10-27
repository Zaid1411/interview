export interface TestCaseItem {
  id: string;
  input: string; // JSON encoded arguments array or string
  expectedOutput: string;
  isHidden?: boolean;
  orderIndex?: number;
}

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

export interface RunnerExecutionPayload {
  language: 'javascript' | 'python';
  code: string;
  testCases: TestCaseItem[];
  timeoutMs?: number;
}

export interface RunnerExecutionResult {
  success: boolean;
  status: 'PASSED' | 'FAILED' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'COMPILE_ERROR';
  passedTests: number;
  totalTests: number;
  testResults: TestResultItem[];
  executionTimeMs?: number;
  memoryKb?: number;
  error?: string;
  consoleOutput?: string;
  providerName: string;
}

export interface ICodeRunnerAdapter {
  readonly providerName: string;
  execute(payload: RunnerExecutionPayload): Promise<RunnerExecutionResult>;
}
