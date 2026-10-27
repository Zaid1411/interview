import { Router } from 'express';
import {
  createSession,
  getActiveSession,
  getSessionById,
  finishSession,
  listUserSessions,
  getSessionResults,
  createSessionSchema,
} from '../controllers/interview.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.post('/start', validateBody(createSessionSchema), createSession);
router.get('/active', getActiveSession);
router.get('/history', listUserSessions);
router.get('/:id', getSessionById);
router.post('/:id/finish', finishSession);
router.get('/:id/results', getSessionResults);

export default router;
