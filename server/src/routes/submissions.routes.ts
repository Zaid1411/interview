import { Router } from 'express';
import {
  runCode,
  submitSolution,
  saveDraft,
  getQuestionSubmissions,
  runCodeSchema,
  submitSolutionSchema,
  saveDraftSchema,
} from '../controllers/submissions.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import { executionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Run Code: Can be executed by guest or logged in user against visible sample tests
router.post('/run', executionLimiter, validateBody(runCodeSchema), runCode);

// Submit Solution: Requires authentication, executes full test suite, marks solved
router.post('/submit', requireAuth, executionLimiter, validateBody(submitSolutionSchema), submitSolution);

// Drafts
router.post('/draft', requireAuth, validateBody(saveDraftSchema), saveDraft);

// Submissions for a question
router.get('/question/:questionId', requireAuth, getQuestionSubmissions);

export default router;
