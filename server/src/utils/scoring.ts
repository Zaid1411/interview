export interface ScoringInput {
  totalQuestions: number;
  solvedQuestions: number;
  totalSubmissions: number;
  failedSubmissions: number;
  firstAttemptSolves: number;
  timeSpentSeconds: number;
  durationMinutes: number;
}

export interface ScoringResult {
  score: number;
  completionRate: number;
  accuracyRate: number;
  timeEfficiencyRate: number;
  breakdown: {
    basePoints: number;
    timeBonus: number;
    accuracyBonus: number;
    penalties: number;
  };
  formulaExplanation: string;
  disclaimer: string;
}

export function calculateInterviewScore(input: ScoringInput): ScoringResult {
  const {
    totalQuestions,
    solvedQuestions,
    totalSubmissions,
    failedSubmissions,
    firstAttemptSolves,
    timeSpentSeconds,
    durationMinutes,
  } = input;

  const totalDurationSeconds = durationMinutes * 60;
  const completionRate = totalQuestions > 0 ? solvedQuestions / totalQuestions : 0;

  // Base score: 75 max points scaled by questions solved
  const basePoints = Math.round(completionRate * 75 * 10) / 10;

  // Time efficiency bonus: up to 15 points if completed before full duration
  const timeUsedRatio = Math.min(1, Math.max(0, timeSpentSeconds / totalDurationSeconds));
  const timeEfficiencyRate = 1 - timeUsedRatio;
  const timeBonus = Math.round(completionRate * timeEfficiencyRate * 15 * 10) / 10;

  // Accuracy bonus: 5 points per question solved on first submission (max 10 points)
  const accuracyBonus = Math.min(10, firstAttemptSolves * 5);

  // Penalty: -2 points per failed attempt before resolution (capped at 15 points penalty)
  const penalties = Math.min(15, failedSubmissions * 2);

  const rawScore = basePoints + timeBonus + accuracyBonus - penalties;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  const accuracyRate = totalSubmissions > 0
    ? Math.round(((totalSubmissions - failedSubmissions) / totalSubmissions) * 100)
    : 0;

  return {
    score,
    completionRate: Math.round(completionRate * 100),
    accuracyRate,
    timeEfficiencyRate: Math.round(timeEfficiencyRate * 100),
    breakdown: {
      basePoints,
      timeBonus,
      accuracyBonus,
      penalties,
    },
    formulaExplanation:
      'Score (0-100) = Base Points (Solved/Total × 75) + Time Efficiency Bonus (up to 15) + First-Pass Bonus (up to 10) - Failed Attempt Penalties (2 pts each).',
    disclaimer:
      'Automated scoring measures coding correctness and algorithmic execution against test suites. It does not replace a comprehensive human interview assessment of communication, system design, or engineering judgment.',
  };
}
