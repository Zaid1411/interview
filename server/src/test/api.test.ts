import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma.js';

describe('InterviewLab Backend API Test Suite', () => {
  let authCookie: string;
  let sampleQuestionId: string;
  let sampleQuestionSlug: string;

  beforeAll(async () => {
    await prisma.$connect();
    const q = await prisma.question.findFirst();
    if (q) {
      sampleQuestionId = q.id;
      sampleQuestionSlug = q.slug;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('InterviewLab API');
  });

  it('POST /api/auth/login should authenticate valid demo user and return session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.developer@interviewlab.dev',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('alex.developer@interviewlab.dev');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = cookies[0];
  });

  it('GET /api/auth/me should return authenticated user profile with stats', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Alex Rivera');
    expect(res.body.user.stats).toBeDefined();
    expect(res.body.user.stats.solvedQuestions).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/questions should return paginated list and topic filters', async () => {
    const res = await request(app).get('/api/questions?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(15);
  });

  it('GET /api/questions/:slug should return details without leaking hidden test cases', async () => {
    const res = await request(app).get(`/api/questions/${sampleQuestionSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(sampleQuestionSlug);
    expect(res.body.data.testCases).toBeDefined();

    // Verify STRICT: No test case returned has isHidden == true
    res.body.data.testCases.forEach((tc: any) => {
      expect(tc.isHidden).toBe(false);
    });
  });

  it('POST /api/submissions/run should execute JavaScript code against sample tests', async () => {
    // Find the Subarray Maximum Profit question
    const q = await prisma.question.findUnique({
      where: { slug: 'subarray-maximum-profit' },
    });

    if (!q) return;

    const res = await request(app)
      .post('/api/submissions/run')
      .send({
        questionId: q.id,
        language: 'javascript',
        code: (q.starterCode as any).javascript,
      });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe('RUN_CODE');
    expect(res.body.passedTests).toBeGreaterThanOrEqual(1);
    expect(res.body.testResults).toBeDefined();
    expect(res.body.testResults.length).toBeGreaterThan(0);
  });
});
