import { Router } from 'express';
import { getUserDashboard, getDetailedAnalytics } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', getUserDashboard);
router.get('/progress', getDetailedAnalytics);

export default router;
