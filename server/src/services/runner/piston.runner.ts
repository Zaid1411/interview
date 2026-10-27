import { ICodeRunnerAdapter, RunnerExecutionPayload, RunnerExecutionResult, TestResultItem } from './runner.interface.js';
import { buildExecutionScript, parseHarnessOutput } from './testHarness.js';
import { config } from '../../config/index.js';

export class PistonRunnerAdapter implements ICodeRunnerAdapter {
  readonly providerName = 'Piston Sandboxed Container';

  private languageMap = {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
  };

  async execute(payload: RunnerExecutionPayload): Promise<RunnerExecutionResult> {
    const { language, code, testCases, timeoutMs = config.executionTimeoutMs } = payload;
    const langConfig = this.languageMap[language];

    if (!langConfig) {
      return {
        success: false,
        status: 'COMPILE_ERROR',
        passedTests: 0,
        totalTests: testCases.length,
        testResults: [],
        error: `Unsupported language: ${language}`,
        providerName: this.providerName,
      };
    }

    const { script } = buildExecutionScript(code, language, testCases);

    try {
      const response = await fetch(`${config.pistonApiUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [
            {
              name: language === 'javascript' ? 'solution.js' : 'solution.py',
              content: script,
            },
          ],
          run_timeout: Math.min(timeoutMs, 6000),
          compile_timeout: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Piston API returned HTTP ${response.status}: ${response.statusText}`);
      }

      const resData = (await response.json()) as {
        run?: {
          stdout?: string;
          stderr?: string;
          code?: number;
          signal?: string;
          output?: string;
        };
      };

      const stdout = resData.run?.stdout || '';
      const stderr = resData.run?.stderr || '';
      const signal = resData.run?.signal;

      if (signal === 'SIGKILL' || signal === 'SIGTERM') {
        return {
          success: false,
          status: 'TIME_LIMIT_EXCEEDED',
          passedTests: 0,
          totalTests: testCases.length,
          testResults: [],
          error: 'Time Limit Exceeded: Process exceeded CPU/execution timeout limits.',
          providerName: this.providerName,
        };
      }

      const parsed = parseHarnessOutput(stdout, stderr, this.providerName);

      if (!parsed.success && (!parsed.testResults || parsed.testResults.length === 0)) {
        return {
          success: false,
          status: 'RUNTIME_ERROR',
          passedTests: 0,
          totalTests: testCases.length,
          testResults: [],
          error: parsed.error || 'Execution resulted in a runtime error.',
          consoleOutput: parsed.logs,
          providerName: this.providerName,
        };
      }

      const testResults: TestResultItem[] = parsed.testResults;
      const passedTests = testResults.filter((t) => t.passed).length;
      const totalTests = testCases.length;
      const allPassed = passedTests === totalTests && totalTests > 0;

      const totalTime = testResults.reduce((acc, t) => acc + (t.executionTimeMs || 0), 0);

      return {
        success: allPassed,
        status: allPassed ? 'PASSED' : 'FAILED',
        passedTests,
        totalTests,
        testResults,
        executionTimeMs: Math.round(totalTime * 100) / 100,
        consoleOutput: parsed.logs,
        providerName: this.providerName,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'RUNTIME_ERROR',
        passedTests: 0,
        totalTests: testCases.length,
        testResults: [],
        error: `Runner connection error: ${err.message || String(err)}`,
        providerName: this.providerName,
      };
    }
  }
}
