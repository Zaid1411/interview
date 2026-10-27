import { apiClient } from './client.js';
import { QuestionDetail } from './questions.js';

export interface InterviewQuestionItem {
  id: string;
  sessionId: string;
  questionId: string;
  orderIndex: number;
  isSolved: boolean;
  solvedAt: string | null;
  question: QuestionDetail;
}

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  durationMinutes: number;
  difficulty: string;
  topics: string[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  startTime: string;
  expiresAt: string;
  completedAt: string | null;
  score: number;
  totalQuestions: number;
  solvedQuestions: number;
  createdAt: string;
  questions: InterviewQuestionItem[];
  drafts?: Record<string, string>;
  submissions?: any[];
  _count?: {
    submissions: number;
  };
}

export interface InterviewResultData {
  session: InterviewSession;
  scoring: {
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
  };
  timeSpentSeconds: number;
  topicStats: Record<string, { total: number; solved: number }>;
  areasForImprovement: string[];
  submissions: any[];
}

export async function createInterviewSession(payload: {
  title?: string;
  durationMinutes: '15' | '30' | '45' | '60';
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  topics?: string[];
  curated?: boolean;
}): Promise<{ message: string; session: InterviewSession }> {
  return apiClient<{ message: string; session: InterviewSession }>('/interviews/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchActiveInterview(): Promise<{ session: InterviewSession | null }> {
  return apiClient<{ session: InterviewSession | null }>('/interviews/active');
}

export async function fetchInterviewSession(id: string): Promise<{ session: InterviewSession }> {
  return apiClient<{ session: InterviewSession }>(`/interviews/${id}`);
}

export async function finishInterviewSession(id: string): Promise<{
  message: string;
  session: InterviewSession;
  scoring: any;
}> {
  return apiClient<{ message: string; session: InterviewSession; scoring: any }>(
    `/interviews/${id}/finish`,
    {
      method: 'POST',
    }
  );
}

export async function fetchInterviewHistory(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: InterviewSession[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All') query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  return apiClient(`/interviews/history?${query.toString()}`);
}

export async function fetchInterviewResults(id: string): Promise<InterviewResultData> {
  return apiClient<InterviewResultData>(`/interviews/${id}/results`);
}
