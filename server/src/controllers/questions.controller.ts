import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma.js';

export async function listQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      difficulty,
      topic,
      sortBy = 'title',
      order = 'asc',
      page = '1',
      limit = '10',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (difficulty && difficulty !== 'All') {
      whereClause.difficulty = difficulty;
    }

    if (topic && topic !== 'All') {
      whereClause.topics = {
        has: topic,
      };
    }

    let orderBy: any = { title: order === 'desc' ? 'desc' : 'asc' };
    if (sortBy === 'difficulty') {
      orderBy = { difficulty: order === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: order === 'desc' ? 'desc' : 'asc' };
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where: whereClause }),
      prisma.question.findMany({
        where: whereClause,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          topics: true,
          createdAt: true,
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      }),
    ]);

    // If user is authenticated, compute whether user has solved each question
    let userSolvedMap: Record<string, boolean> = {};
    if (req.user) {
      const solved = await prisma.submission.findMany({
        where: {
          userId: req.user.id,
          status: 'PASSED',
          questionId: { in: questions.map((q) => q.id) },
        },
        select: { questionId: true },
        distinct: ['questionId'],
      });
      solved.forEach((s) => {
        userSolvedMap[s.questionId] = true;
      });
    }

    const enriched = questions.map((q) => ({
      ...q,
      submissionCount: q._count.submissions,
      isSolved: !!userSolvedMap[q.id],
    }));

    res.status(200).json({
      data: enriched,
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

export async function getQuestionBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const question = await prisma.question.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        testCases: {
          where: { isHidden: false }, // STRICT: NEVER LEAK HIDDEN TEST CASES TO CLIENT!
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            orderIndex: true,
            isHidden: true,
          },
        },
        _count: {
          select: {
            testCases: true,
            submissions: true,
          },
        },
      },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    let isSolved = false;
    let savedDraft: string | null = null;

    if (req.user) {
      const [solvedCheck, draft] = await Promise.all([
        prisma.submission.findFirst({
          where: {
            userId: req.user.id,
            questionId: question.id,
            status: 'PASSED',
          },
        }),
        prisma.codeDraft.findFirst({
          where: {
            userId: req.user.id,
            questionId: question.id,
            interviewSessionId: null,
          },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      isSolved = !!solvedCheck;
      savedDraft = draft?.code || null;
    }

    res.status(200).json({
      data: {
        ...question,
        totalTestCases: question._count.testCases,
        submissionCount: question._count.submissions,
        isSolved,
        savedDraft,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTopics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const questions = await prisma.question.findMany({
      select: { topics: true },
    });

    const topicSet = new Set<string>();
    questions.forEach((q) => q.topics.forEach((t) => topicSet.add(t)));

    res.status(200).json({
      topics: Array.from(topicSet).sort(),
    });
  } catch (err) {
    next(err);
  }
}
