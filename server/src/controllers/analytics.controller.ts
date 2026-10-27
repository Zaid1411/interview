import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma.js';

export async function getUserDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;

    // 1. Attempted & Solved questions
    const [attemptedGroups, solvedGroups] = await Promise.all([
      prisma.submission.groupBy({
        by: ['questionId'],
        where: { userId },
      }),
      prisma.submission.groupBy({
        by: ['questionId'],
        where: { userId, status: 'PASSED' },
      }),
    ]);

    const totalAttempted = attemptedGroups.length;
    const totalSolved = solvedGroups.length;
    const solvedQuestionIds = solvedGroups.map((g) => g.questionId);

    // 2. Average execution time of solved submissions
    const solvedSubmissions = await prisma.submission.findMany({
      where: { userId, status: 'PASSED', executionTimeMs: { not: null } },
      select: { executionTimeMs: true },
    });

    const avgExecutionTime =
      solvedSubmissions.length > 0
        ? Math.round(
            (solvedSubmissions.reduce((acc, s) => acc + (s.executionTimeMs || 0), 0) /
              solvedSubmissions.length) *
              10
          ) / 10
        : 0;

    // 3. Current streak calculation from actual submission timestamps
    const userSubmissions = await prisma.submission.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const activeDaysSet = new Set<string>();
    userSubmissions.forEach((s) => {
      const dayStr = s.createdAt.toISOString().split('T')[0];
      activeDaysSet.add(dayStr);
    });

    const sortedDays = Array.from(activeDaysSet).sort().reverse();
    let currentStreak = 0;

    if (sortedDays.length > 0) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Streak is alive if user has activity today or yesterday
      if (sortedDays[0] === todayStr || sortedDays[0] === yesterdayStr) {
        let cursorDate = new Date(sortedDays[0]);
        currentStreak = 1;

        for (let i = 1; i < sortedDays.length; i++) {
          cursorDate = new Date(cursorDate.getTime() - 24 * 60 * 60 * 1000);
          const expectedPrevStr = cursorDate.toISOString().split('T')[0];
          if (sortedDays[i] === expectedPrevStr) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // 4. Weekly activity chart (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklySubmissions = await prisma.submission.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyActivity = [];
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = targetDate.toISOString().split('T')[0];
      const dayName = dayNames[targetDate.getDay()];

      const daySubs = weeklySubmissions.filter(
        (s) => s.createdAt.toISOString().split('T')[0] === dateKey
      );
      const passedSubs = daySubs.filter((s) => s.status === 'PASSED').length;

      weeklyActivity.push({
        date: dateKey,
        day: dayName,
        submissions: daySubs.length,
        solved: passedSubs,
      });
    }

    // 5. Topic-wise performance
    const allQuestions = await prisma.question.findMany({
      select: { id: true, topics: true, difficulty: true },
    });

    const topicMap: Record<string, { total: number; solved: number; attempted: number }> = {};
    const attemptedIdsSet = new Set(attemptedGroups.map((g) => g.questionId));
    const solvedIdsSet = new Set(solvedQuestionIds);

    allQuestions.forEach((q) => {
      q.topics.forEach((t) => {
        if (!topicMap[t]) topicMap[t] = { total: 0, solved: 0, attempted: 0 };
        topicMap[t].total++;
        if (attemptedIdsSet.has(q.id)) topicMap[t].attempted++;
        if (solvedIdsSet.has(q.id)) topicMap[t].solved++;
      });
    });

    const topicPerformance = Object.entries(topicMap).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      solved: stats.solved,
      attempted: stats.attempted,
      accuracy: stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0,
      completionRate: Math.round((stats.solved / stats.total) * 100),
    }));

    // 6. Recent interview sessions
    const recentSessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        score: true,
        durationMinutes: true,
        solvedQuestions: true,
        totalQuestions: true,
        createdAt: true,
      },
    });

    // 7. Recommended questions based on past activity
    // Prioritize questions from topics where solved < total or unattempted
    const unsolvedQuestions = await prisma.question.findMany({
      where: {
        id: { notIn: solvedQuestionIds },
      },
      take: 4,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        topics: true,
      },
    });

    res.status(200).json({
      metrics: {
        totalAttempted,
        totalSolved,
        currentStreak,
        avgExecutionTimeMs: avgExecutionTime,
      },
      weeklyActivity,
      topicPerformance,
      recentSessions,
      recommendedQuestions: unsolvedQuestions,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDetailedAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;

    // Cumulative questions solved over past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const passedSubmissions = await prisma.submission.findMany({
      where: {
        userId,
        status: 'PASSED',
      },
      orderBy: { createdAt: 'asc' },
      select: {
        questionId: true,
        createdAt: true,
        language: true,
      },
    });

    // Compute first-solve date per question
    const firstSolveMap = new Map<string, Date>();
    passedSubmissions.forEach((s) => {
      if (!firstSolveMap.has(s.questionId)) {
        firstSolveMap.set(s.questionId, s.createdAt);
      }
    });

    const solvedOverTime = [];
    let cumulative = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];

      let solvedToday = 0;
      firstSolveMap.forEach((solveDate) => {
        if (solveDate.toISOString().split('T')[0] === dateStr) {
          solvedToday++;
        }
      });

      cumulative += solvedToday;
      solvedOverTime.push({
        date: dateStr,
        cumulativeSolved: cumulative,
        newSolved: solvedToday,
      });
    }

    // Language usage breakdown
    const allSubs = await prisma.submission.findMany({
      where: { userId },
      select: { language: true, status: true },
    });

    const languageStats: Record<string, { total: number; passed: number }> = {};
    allSubs.forEach((s) => {
      if (!languageStats[s.language]) languageStats[s.language] = { total: 0, passed: 0 };
      languageStats[s.language].total++;
      if (s.status === 'PASSED') languageStats[s.language].passed++;
    });

    // Difficulty breakdown
    const allQuestions = await prisma.question.findMany({
      select: { id: true, difficulty: true },
    });

    const solvedQIds = Array.from(firstSolveMap.keys());
    const difficultyStats: Record<string, { total: number; solved: number }> = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
    };

    allQuestions.forEach((q) => {
      if (difficultyStats[q.difficulty]) {
        difficultyStats[q.difficulty].total++;
        if (solvedQIds.includes(q.id)) {
          difficultyStats[q.difficulty].solved++;
        }
      }
    });

    res.status(200).json({
      solvedOverTime,
      languageStats,
      difficultyStats,
      totalSubmissions: allSubs.length,
    });
  } catch (err) {
    next(err);
  }
}
