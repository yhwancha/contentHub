import { Router, Request, Response } from 'express';
import { collectorService } from '../services/collector.service.js';
import { logger } from '../lib/logger.js';

const router = Router();

// POST /api/admin/ingest - Manually trigger ingestion (dev only)
router.post('/ingest', async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Manual ingestion not allowed in production',
    });
    return;
  }

  logger.info('Manual ingestion triggered');

  // Run ingestion in background
  collectorService.runIngestion().catch((error) => {
    logger.error({ error }, 'Manual ingestion failed');
  });

  res.json({
    status: 'started',
    message: 'Ingestion started in background',
  });
});

export default router;
