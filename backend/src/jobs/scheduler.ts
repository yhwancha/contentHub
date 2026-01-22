import cron from 'node-cron';
import { logger } from '../lib/logger.js';
import { settingsService } from '../services/settings.service.js';
import { ingestionRunService } from '../services/ingestion-run.service.js';
import { collectorService } from '../services/collector.service.js';

async function shouldRunNow(): Promise<boolean> {
  const intervalMinutes = await settingsService.getIngestIntervalMinutes();
  const lastRun = await ingestionRunService.getLastSuccessfulRun();

  if (!lastRun) {
    // Never ran before, should run now
    logger.info('No previous successful run found, will run ingestion');
    return true;
  }

  const lastRunTime = lastRun.startedAt.getTime();
  const now = Date.now();
  const elapsedMinutes = (now - lastRunTime) / (1000 * 60);

  const shouldRun = elapsedMinutes >= intervalMinutes;

  logger.debug(
    {
      lastRunTime: lastRun.startedAt.toISOString(),
      elapsedMinutes: Math.round(elapsedMinutes),
      intervalMinutes,
      shouldRun,
    },
    'Checking if ingestion should run'
  );

  return shouldRun;
}

async function tick(): Promise<void> {
  try {
    if (await shouldRunNow()) {
      await collectorService.runIngestion();
    }
  } catch (error) {
    // Log but don't crash - scheduler must keep running
    logger.error({ error }, 'Scheduler tick error');
  }
}

let scheduledTask: cron.ScheduledTask | null = null;

export function startScheduler(): void {
  if (scheduledTask) {
    logger.warn('Scheduler already running');
    return;
  }

  // Run every minute (tick+gate pattern)
  scheduledTask = cron.schedule('* * * * *', () => {
    tick();
  });

  logger.info('Scheduler started (tick every minute)');

  // Run immediately on startup
  tick();
}

export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    logger.info('Scheduler stopped');
  }
}

export const scheduler = {
  start: startScheduler,
  stop: stopScheduler,
  tick, // Exposed for manual trigger
};
