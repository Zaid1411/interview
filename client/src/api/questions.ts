import { apiClient } from './client.js';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  orderIndex: number;
  isHidden: boolean;
}

export interface QuestionListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  submissionCount: number;
  isSolved: boolean;
  createdAt: string;
}

export interface QuestionDetail extends QuestionListItem {
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: { javascript: string; python: string };
  hints: string[];
  editorial: string;
  testCases: TestCase[];
  totalTestCases: number;
  savedDraft?: string | null;
}

export interface QuestionListResponse {
  data: QuestionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchQuestions(params: {
  search?: string;
  difficulty?: string;
  topic?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}): Promise<QuestionListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.difficulty && params.difficulty !== 'All') query.set('difficulty', params.difficulty);
  if (params.topic && params.topic !== 'All') query.set('topic', params.topic);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.order) query.set('order', params.order);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  return apiClient<QuestionListResponse>(`/questions?${query.toString()}`);
}

export async function fetchQuestionDetail(slugOrId: string): Promise<{ data: QuestionDetail }> {
  return apiClient<{ data: QuestionDetail }>(`/questions/${slugOrId}`);
}

export async function fetchTopics(): Promise<{ topics: string[] }> {
  return apiClient<{ topics: string[] }>('/questions/topics');
}
