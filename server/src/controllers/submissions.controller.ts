import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { codeRunner } from '../services/runner/runner.factory.js';

export const runCodeSchema = z.object({
  questionId: z.string().uuid(),
  language: z.enum(['javascript', 'python']),
  code: z.string().min(1, 'Code cannot be empty').max(64000, 'Code size exceeds limit'),
});

export const submitSolutionSchema = z.object({
  questionId: z.string().uuid(),
  language: z.enum(['javascript', 'python']),
  code: z.string().min(1, 'Code cannot be empty').max(64000, 'Code size exceeds limit'),
  interviewSessionId: z.string().uuid().optional(),
});

export const saveDraftSchema = z.object({
  questionId: z.string().uuid(),
  language: z.enum(['javascript', 'python']),
  code: z.string().max(64000),
  interviewSessionId: z.string().uuid().optional(),
});

// Run Code: against visible sample test cases only
export async function runCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { questionId, language, code } = req.body;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        testCases: {
          where: { isHidden: false }, // Visible sample tests only
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    if (question.testCases.length === 0) {
      res.status(400).json({ error: 'No sample test cases configured for this problem.' });
      return;
    }

    const runnerResult = await codeRunner.execute({
      language,
      code,
      testCases: question.testCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false,
        orderIndex: tc.orderIndex,
      })),
    });

    // Run Code never records solved status or creates database submission
    res.status(200).json({
      action: 'RUN_CODE',
      success: runnerResult.success,
      status: runnerResult.status,
      passedTests: runnerResult.passedTests,
      totalTests: runnerResult.totalTests,
      testResults: runnerResult.testResults,
      executionTimeMs: runnerResult.executionTimeMs,
      consoleOutput: runnerResult.consoleOutput,
      error: runnerResult.error,
      provider: runnerResult.providerName,
    });
  } catch (err) {
    next(err);
  }
}

// Submit Solution: against full test suite (sample + hidden)
export async function submitSolution(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required to submit solutions.' });
      return;
    }

    const { questionId, language, code, interviewSessionId } = req.body;

    // Check interview session expiry if submitted inside an interview room
    let interviewSession = null;
    if (interviewSessionId) {
      interviewSession = await prisma.interviewSession.findUnique({
        where: { id: interviewSessionId },
        include: { questions: true },
      });

      if (!interviewSession || interviewSession.userId !== req.user.id) {
        res.status(404).json({ error: 'Interview session not found or access denied.' });
        return;
      }

      const now = new Date();
      if (interviewSession.status !== 'IN_PROGRESS' || now > interviewSession.expiresAt) {
        // Automatically mark expired if past deadline
        if (interviewSession.status === 'IN_PROGRESS') {
          await prisma.interviewSession.update({
            where: { id: interviewSessionId },
            data: { status: 'EXPIRED', completedAt: now },
          });
        }
        res.status(403).json({
          error: 'This interview session has ended or expired. Submissions are no longer accepted.',
        });
        return;
      }
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        testCases: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    // Execute against all test cases
    const runnerResult = await codeRunner.execute({
      language,
      code,
      testCases: question.testCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
        orderIndex: tc.orderIndex,
      })),
    });

    const isAllPassed = runnerResult.success && runnerResult.passedTests === question.testCases.length;

    // Sanitize test results: DO NOT LEAK HIDDEN TEST CASE DETAILS TO CLIENT!
    const sanitizedTestResults = runnerResult.testResults.map((t) => {
      if (t.isHidden) {
        return {
          id: t.id,
          orderIndex: t.orderIndex,
          passed: t.passed,
          isHidden: true,
          executionTimeMs: t.executionTimeMs,
          error: t.passed ? undefined : 'Hidden test case failed.',
        };
      }
      return t;
    });

    // Save submission record in database
    const submission = await prisma.submission.create({
      data: {
        userId: req.user.id,
        questionId: question.id,
        interviewSessionId: interviewSessionId || null,
        language,
        code,
        status: runnerResult.status,
        passedTests: runnerResult.passedTests,
        totalTests: runnerResult.totalTests,
        executionTimeMs: runnerResult.executionTimeMs || null,
        error: runnerResult.error || null,
        details: sanitizedTestResults as any,
      },
    });

    // If within interview room and passed, mark interview question as solved
    if (interviewSessionId && isAllPassed) {
      await prisma.interviewQuestion.updateMany({
        where: {
          sessionId: interviewSessionId,
          questionId: question.id,
        },
        data: {
          isSolved: true,
          solvedAt: new Date(),
        },
      });

      // Update solved count on interview session
      const solvedCount = await prisma.interviewQuestion.count({
        where: {
          sessionId: interviewSessionId,
          isSolved: true,
        },
      });

      await prisma.interviewSession.update({
        where: { id: interviewSessionId },
        data: { solvedQuestions: solvedCount },
      });
    }

    res.status(200).json({
      action: 'SUBMIT_SOLUTION',
      submissionId: submission.id,
      success: isAllPassed,
      status: runnerResult.status,
      passedTests: runnerResult.passedTests,
      totalTests: runnerResult.totalTests,
      testResults: sanitizedTestResults,
      executionTimeMs: runnerResult.executionTimeMs,
      consoleOutput: runnerResult.consoleOutput,
      error: runnerResult.error,
      provider: runnerResult.providerName,
      isSolved: isAllPassed,
      createdAt: submission.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

// Save draft
export async function saveDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { questionId, language, code, interviewSessionId } = req.body;

    const draft = await prisma.codeDraft.upsert({
      where: {
        userId_questionId_interviewSessionId_language: {
          userId: req.user.id,
          questionId,
          interviewSessionId: interviewSessionId || null as any,
          language,
        },
      },
      update: {
        code,
        updatedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        questionId,
        interviewSessionId: interviewSessionId || null,
        language,
        code,
      },
    });

    res.status(200).json({
      message: 'Draft saved',
      updatedAt: draft.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

// Get user submissions for a question
export async function getQuestionSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { questionId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: {
        userId: req.user.id,
        questionId,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        language: true,
        status: true,
        passedTests: true,
        totalTests: true,
        executionTimeMs: true,
        createdAt: true,
        code: true,
      },
    });

    res.status(200).json({ data: submissions });
  } catch (err) {
    next(err);
  }
}
