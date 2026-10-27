import { ICodeRunnerAdapter, RunnerExecutionPayload, RunnerExecutionResult, TestResultItem } from './runner.interface.js';
import { buildExecutionScript, parseHarnessOutput } from './testHarness.js';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { config } from '../../config/index.js';

const execFileAsync = promisify(execFile);

export class IsolatedProcessRunnerAdapter implements ICodeRunnerAdapter {
  readonly providerName = 'Isolated Subprocess Runner';

  async execute(payload: RunnerExecutionPayload): Promise<RunnerExecutionResult> {
    const { language, code, testCases, timeoutMs = config.executionTimeoutMs } = payload;

    const tmpDir = path.join(os.tmpdir(), 'interviewlab-runner');
    await fs.mkdir(tmpDir, { recursive: true });

    const fileId = crypto.randomBytes(8).toString('hex');
    const ext = language === 'javascript' ? 'js' : 'py';
    const filePath = path.join(tmpDir, `run_${fileId}.${ext}`);

    const { script } = buildExecutionScript(code, language, testCases);
    await fs.writeFile(filePath, script, 'utf-8');

    // Strict isolated environment - DO NOT PASS SECRETS OR PARENT ENV!
    const isolatedEnv = {
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      LANG: 'en_US.UTF-8',
    };

    const cmd = language === 'javascript' ? 'node' : 'python3';
    const args = language === 'javascript' ? ['--max-old-space-size=64', filePath] : ['-I', '-S', '-B', filePath];

    try {
      const { stdout, stderr } = await execFileAsync(cmd, args, {
        timeout: timeoutMs,
        maxBuffer: 64 * 1024, // 64KB max output
        env: isolatedEnv,
      });

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
      if (err.killed || err.signal === 'SIGTERM') {
        return {
          success: false,
          status: 'TIME_LIMIT_EXCEEDED',
          passedTests: 0,
          totalTests: testCases.length,
          testResults: [],
          error: `Time Limit Exceeded: Execution took longer than ${timeoutMs}ms.`,
          providerName: this.providerName,
        };
      }

      return {
        success: false,
        status: 'RUNTIME_ERROR',
        passedTests: 0,
        totalTests: testCases.length,
        testResults: [],
        error: err.stderr || err.message || 'Execution error.',
        providerName: this.providerName,
      };
    } finally {
      // Always cleanup isolated temporary files
      await fs.unlink(filePath).catch(() => {});
    }
  }
}
