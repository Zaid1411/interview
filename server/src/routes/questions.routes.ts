import { Router } from 'express';
import { listQuestions, getQuestionBySlug, getTopics } from '../controllers/questions.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/topics', getTopics);
router.get('/', optionalAuth, listQuestions);
router.get('/:slug', optionalAuth, getQuestionBySlug);

export default router;
