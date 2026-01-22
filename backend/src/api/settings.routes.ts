import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { settingsService } from '../services/settings.service.js';
import { logger } from '../lib/logger.js';

const router = Router();

const UpdateIntervalSchema = z.object({
  minutes: z.number().int().min(1).max(10080),
});

// GET /api/settings - Get all settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await settingsService.getAllSettings();
    res.json({ settings });
  } catch (error) {
    logger.error({ error }, 'Failed to get settings');
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch settings',
    });
  }
});

// PATCH /api/settings/ingest-interval - Update ingestion interval
router.patch('/ingest-interval', async (req: Request, res: Response) => {
  try {
    const { minutes } = UpdateIntervalSchema.parse(req.body);

    await settingsService.updateIngestInterval(minutes);

    const setting = {
      key: 'ingest_interval_minutes',
      value: String(minutes),
      updatedAt: new Date().toISOString(),
    };

    logger.info({ minutes }, 'Ingestion interval updated');
    res.json(setting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid interval value. Must be between 1 and 10080 minutes.',
        details: error.errors,
      });
      return;
    }

    logger.error({ error }, 'Failed to update ingestion interval');
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to update interval',
    });
  }
});

export default router;
