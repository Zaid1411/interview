import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { calculateInterviewScore } from '../utils/scoring.js';

export const createSessionSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  durationMinutes: z.enum(['15', '30', '45', '60']).transform((val) => parseInt(val, 10)),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed']).optional().default('Mixed'),
  topics: z.array(z.string()).optional().default([]),
  curated: z.boolean().optional().default(false),
});

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, durationMinutes, difficulty, topics, curated } = req.body;

    // Check for existing active session that hasn't expired
    const activeSession = await prisma.interviewSession.findFirst({
      where: {
        userId: req.user.id,
        status: 'IN_PROGRESS',
        expiresAt: { gt: new Date() },
      },
      include: {
        questions: {
          include: {
            question: {
              select: { id: true, title: true, slug: true, difficulty: true },
            },
          },
        },
      },
    });

    if (activeSession) {
      res.status(409).json({
        error: 'You already have an active interview session in progress.',
        activeSessionId: activeSession.id,
      });
      return;
    }

    // Determine number of questions based on duration:
    // 15 min -> 1 question
    // 30 min -> 2 questions
    // 45 min -> 2-3 questions
    // 60 min -> 3-4 questions
    let questionCount = 2;
    if (durationMinutes === 15) questionCount = 1;
    else if (durationMinutes === 30) questionCount = 2;
    else if (durationMinutes === 45) questionCount = 3;
    else if (durationMinutes === 60) questionCount = 4;

    const whereClause: any = {};
    if (difficulty && difficulty !== 'Mixed') {
      whereClause.difficulty = difficulty;
    }
    if (topics && topics.length > 0) {
      whereClause.topics = { hasSome: topics };
    }

    // Find candidate questions
    let candidateQuestions = await prisma.question.findMany({
      where: whereClause,
      select: { id: true, difficulty: true, topics: true },
    });

    // If not enough questions match strict filters, fallback to any available questions
    if (candidateQuestions.length < questionCount) {
      candidateQuestions = await prisma.question.findMany({
        select: { id: true, difficulty: true, topics: true },
      });
    }

    // Shuffle and pick questionCount
    const shuffled = [...candidateQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, questionCount);

    if (selectedQuestions.length === 0) {
      res.status(400).json({ error: 'No questions found to generate interview.' });
      return;
    }

    const startTime = new Date();
    const expiresAt = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const sessionTitle =
      title ||
      `${difficulty} ${durationMinutes}-Min Technical Mock (${selectedQuestions.length} Questions)`;

    const session = await prisma.interviewSession.create({
      data: {
        userId: req.user.id,
        title: sessionTitle,
        durationMinutes,
        difficulty,
        topics: topics.length > 0 ? topics : ['General'],
        status: 'IN_PROGRESS',
        startTime,
        expiresAt,
        totalQuestions: selectedQuestions.length,
        questions: {
          create: selectedQuestions.map((q, idx) => ({
            questionId: q.id,
            orderIndex: idx,
            isSolved: false,
          })),
        },
      },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                topics: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.status(201).json({
      message: 'Interview session started',
      session,
    });
  } catch (err) {
    next(err);
  }
}

export async function getActiveSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const session = await prisma.interviewSession.findFirst({
      where: {
        userId: req.user.id,
        status: 'IN_PROGRESS',
        expiresAt: { gt: new Date() },
      },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                topics: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!session) {
      res.status(200).json({ session: null });
      return;
    }

    res.status(200).json({ session });
  } catch (err) {
    next(err);
  }
}

export async function getSessionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              include: {
                testCases: {
                  where: { isHidden: false }, // Sample tests only
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        submissions: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            questionId: true,
            language: true,
            status: true,
            passedTests: true,
            totalTests: true,
            executionTimeMs: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.userId !== req.user.id) {
      res.status(404).json({ error: 'Interview session not found or unauthorized.' });
      return;
    }

    // Check if expired and update if needed
    const now = new Date();
    let currentStatus = session.status;
    if (currentStatus === 'IN_PROGRESS' && now > session.expiresAt) {
      currentStatus = 'EXPIRED';
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: { status: 'EXPIRED', completedAt: session.expiresAt },
      });
    }

    // Load drafts for this session
    const drafts = await prisma.codeDraft.findMany({
      where: {
        userId: req.user.id,
        interviewSessionId: session.id,
      },
    });

    const draftsMap: Record<string, string> = {};
    drafts.forEach((d) => {
      draftsMap[`${d.questionId}_${d.language}`] = d.code;
    });

    res.status(200).json({
      session: {
        ...session,
        status: currentStatus,
        drafts: draftsMap,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function finishSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        questions: true,
        submissions: true,
      },
    });

    if (!session || session.userId !== req.user.id) {
      res.status(404).json({ error: 'Interview session not found or unauthorized.' });
      return;
    }

    if (session.status === 'COMPLETED') {
      res.status(200).json({
        message: 'Interview was already marked completed.',
        sessionId: session.id,
      });
      return;
    }

    const now = new Date();
    const effectiveCompletionTime = now > session.expiresAt ? session.expiresAt : now;
    const timeSpentSeconds = Math.round((effectiveCompletionTime.getTime() - session.startTime.getTime()) / 1000);

    const solvedQuestions = session.questions.filter((q) => q.isSolved).length;
    const totalQuestions = session.totalQuestions;

    const totalSubmissions = session.submissions.length;
    const failedSubmissions = session.submissions.filter((s) => s.status !== 'PASSED').length;

    // Count questions solved on first attempt
    let firstAttemptSolves = 0;
    for (const q of session.questions) {
      const qSubmissions = session.submissions
        .filter((s) => s.questionId === q.questionId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      if (qSubmissions.length > 0 && qSubmissions[0].status === 'PASSED') {
        firstAttemptSolves++;
      }
    }

    const scoringResult = calculateInterviewScore({
      totalQuestions,
      solvedQuestions,
      totalSubmissions,
      failedSubmissions,
      firstAttemptSolves,
      timeSpentSeconds,
      durationMinutes: session.durationMinutes,
    });

    const updatedSession = await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        completedAt: effectiveCompletionTime,
        solvedQuestions,
        score: scoringResult.score,
      },
    });

    res.status(200).json({
      message: 'Interview completed successfully',
      session: updatedSession,
      scoring: scoringResult,
    });
  } catch (err) {
    next(err);
  }
}

export async function listUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const whereClause: any = { userId: req.user.id };
    if (status && status !== 'All') {
      whereClause.status = status;
    }

    const [total, sessions] = await Promise.all([
      prisma.interviewSession.count({ where: whereClause }),
      prisma.interviewSession.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          questions: {
            include: {
              question: {
                select: { id: true, title: true, slug: true, difficulty: true, topics: true },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: { submissions: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      data: sessions,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                topics: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        submissions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session || session.userId !== req.user.id) {
      res.status(404).json({ error: 'Session not found or unauthorized' });
      return;
    }

    const effectiveEnd = session.completedAt || session.expiresAt;
    const timeSpentSeconds = Math.max(0, Math.round((effectiveEnd.getTime() - session.startTime.getTime()) / 1000));

    const totalQuestions = session.totalQuestions;
    const solvedQuestions = session.solvedQuestions;
    const totalSubmissions = session.submissions.length;
    const failedSubmissions = session.submissions.filter((s) => s.status !== 'PASSED').length;

    let firstAttemptSolves = 0;
    for (const q of session.questions) {
      const qSubs = session.submissions.filter((s) => s.questionId === q.questionId);
      if (qSubs.length > 0 && qSubs[0].status === 'PASSED') {
        firstAttemptSolves++;
      }
    }

    const scoring = calculateInterviewScore({
      totalQuestions,
      solvedQuestions,
      totalSubmissions,
      failedSubmissions,
      firstAttemptSolves,
      timeSpentSeconds,
      durationMinutes: session.durationMinutes,
    });

    // Topic performance breakdown
    const topicStats: Record<string, { total: number; solved: number }> = {};
    session.questions.forEach((iq) => {
      iq.question.topics.forEach((t) => {
        if (!topicStats[t]) topicStats[t] = { total: 0, solved: 0 };
        topicStats[t].total += 1;
        if (iq.isSolved) topicStats[t].solved += 1;
      });
    });

    // Areas for improvement
    const areasForImprovement: string[] = [];
    Object.entries(topicStats).forEach(([t, s]) => {
      if (s.solved < s.total) {
        areasForImprovement.push(`Review problem patterns for ${t} (unsolved in this session).`);
      }
    });
    if (failedSubmissions > 2) {
      areasForImprovement.push('Practice edge cases before submitting to avoid repeated failed runs.');
    }
    if (timeSpentSeconds > session.durationMinutes * 60 * 0.9 && solvedQuestions < totalQuestions) {
      areasForImprovement.push('Time management: Allocate fixed time per question and move on if blocked.');
    }
    if (areasForImprovement.length === 0) {
      areasForImprovement.push('Excellent execution! Challenge yourself with Hard difficulty problems next.');
    }

    res.status(200).json({
      session,
      scoring,
      timeSpentSeconds,
      topicStats,
      areasForImprovement,
      submissions: session.submissions,
    });
  } catch (err) {
    next(err);
  }
}
