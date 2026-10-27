import { apiClient } from './client.js';

export interface DashboardMetrics {
  totalAttempted: number;
  totalSolved: number;
  currentStreak: number;
  avgExecutionTimeMs: number;
}

export interface WeeklyActivityItem {
  date: string;
  day: string;
  submissions: number;
  solved: number;
}

export interface TopicPerformanceItem {
  topic: string;
  total: number;
  solved: number;
  attempted: number;
  accuracy: number;
  completionRate: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  weeklyActivity: WeeklyActivityItem[];
  topicPerformance: TopicPerformanceItem[];
  recentSessions: Array<{
    id: string;
    title: string;
    status: string;
    score: number;
    durationMinutes: number;
    solvedQuestions: number;
    totalQuestions: number;
    createdAt: string;
  }>;
  recommendedQuestions: Array<{
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    topics: string[];
  }>;
}

export interface DetailedAnalyticsData {
  solvedOverTime: Array<{
    date: string;
    cumulativeSolved: number;
    newSolved: number;
  }>;
  languageStats: Record<string, { total: number; passed: number }>;
  difficultyStats: Record<string, { total: number; solved: number }>;
  totalSubmissions: number;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return apiClient<DashboardData>('/analytics/dashboard');
}

export async function fetchDetailedAnalytics(): Promise<DetailedAnalyticsData> {
  return apiClient<DetailedAnalyticsData>('/analytics/progress');
}
