import { ICodeRunnerAdapter, RunnerExecutionPayload, RunnerExecutionResult } from './runner.interface.js';
import { PistonRunnerAdapter } from './piston.runner.js';
import { IsolatedProcessRunnerAdapter } from './isolated.runner.js';
import { MockRunnerAdapter } from './mock.runner.js';
import { config } from '../../config/index.js';

class ResilientCodeRunner implements ICodeRunnerAdapter {
  private pistonRunner = new PistonRunnerAdapter();
  private isolatedRunner = new IsolatedProcessRunnerAdapter();
  private mockRunner = new MockRunnerAdapter();

  get providerName(): string {
    const configured = config.codeRunnerProvider.toLowerCase();
    if (configured === 'mock') return this.mockRunner.providerName;
    if (configured === 'isolated') return this.isolatedRunner.providerName;
    return this.pistonRunner.providerName;
  }

  async execute(payload: RunnerExecutionPayload): Promise<RunnerExecutionResult> {
    const configured = config.codeRunnerProvider.toLowerCase();

    if (configured === 'mock') {
      return this.mockRunner.execute(payload);
    }

    if (configured === 'isolated') {
      return this.isolatedRunner.execute(payload);
    }

    // Default: try Piston container runner first
    try {
      const result = await this.pistonRunner.execute(payload);
      // If error is network connection failure, fall back to isolated subprocess runner
      if (!result.success && result.error && result.error.includes('Runner connection error')) {
        console.warn('⚠️ Piston container API unreachable. Falling back to isolated subprocess runner...');
        return await this.isolatedRunner.execute(payload);
      }
      return result;
    } catch (err) {
      console.warn('⚠️ Piston runner threw exception. Falling back to isolated subprocess runner...', err);
      return await this.isolatedRunner.execute(payload);
    }
  }
}

export const codeRunner = new ResilientCodeRunner();
