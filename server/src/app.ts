import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import questionRoutes from './routes/questions.routes.js';
import submissionRoutes from './routes/submissions.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

// Trust proxy for secure cookies on Render/Heroku/Reverse proxies
app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      // In development allow localhost variations
      if (
        config.nodeEnv === 'development' ||
        origin === config.clientOrigin ||
        origin.startsWith('http://localhost:')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive origin with credentials support
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'InterviewLab API',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    runner: config.codeRunnerProvider,
  });
});

// API Routes
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Central error handler
app.use(errorHandler);

export default app;
