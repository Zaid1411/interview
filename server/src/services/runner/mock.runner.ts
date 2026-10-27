import { ICodeRunnerAdapter, RunnerExecutionPayload, RunnerExecutionResult } from './runner.interface.js';

export class MockRunnerAdapter implements ICodeRunnerAdapter {
  readonly providerName = 'Mock Dry-Run Development Adapter (Safe Static Evaluation)';

  async execute(payload: RunnerExecutionPayload): Promise<RunnerExecutionResult> {
    const { testCases } = payload;

    return {
      success: false,
      status: 'RUNTIME_ERROR',
      passedTests: 0,
      totalTests: testCases.length,
      testResults: testCases.map((tc, idx) => ({
        id: tc.id,
        orderIndex: tc.orderIndex ?? idx,
        passed: false,
        error: '[MOCK RUNNER] Execution provider disabled. Arbitrary code is safely withheld from execution.',
        expected: tc.isHidden ? undefined : tc.expectedOutput,
        input: tc.isHidden ? undefined : tc.input,
        isHidden: !!tc.isHidden,
        executionTimeMs: 0,
      })),
      error: 'NOTICE: The system is configured with MockRunnerAdapter. To execute live code in containers, enable Piston or Isolated runner in server configuration.',
      consoleOutput: '[Mock Runner Active] Live execution disabled in current environment.',
      providerName: this.providerName,
    };
  }
}
