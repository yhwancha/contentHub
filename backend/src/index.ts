import express from 'express';
import cors from 'cors';
import { logger } from './lib/logger.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import healthRoutes from './api/health.routes.js';
import articlesRoutes from './api/articles.routes.js';
import adminRoutes from './api/admin.routes.js';
import settingsRoutes from './api/settings.routes.js';
import { scheduler } from './jobs/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');

  // Start scheduler after server is ready
  scheduler.start();
});

export default app;
