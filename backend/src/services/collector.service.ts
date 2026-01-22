import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { fetchRssFeed } from '../lib/rss-parser.js';
import { withRetry } from '../lib/retry.js';
import { ingestionRunService } from './ingestion-run.service.js';

interface CollectionResult {
  newCount: number;
  updatedCount: number;
}

async function upsertArticles(
  items: Awaited<ReturnType<typeof fetchRssFeed>>
): Promise<CollectionResult> {
  let newCount = 0;
  let updatedCount = 0;

  for (const item of items) {
    const existing = await prisma.article.findUnique({
      where: { guid: item.guid },
    });

    if (existing) {
      // Update if title changed
      if (existing.title !== item.title) {
        await prisma.article.update({
          where: { guid: item.guid },
          data: {
            title: item.title,
            url: item.url,
          },
        });
        updatedCount++;
      }
    } else {
      // Create new article
      await prisma.article.create({
        data: {
          source: 'geeknews',
          guid: item.guid,
          title: item.title,
          url: item.url,
          publishedAt: item.publishedAt,
          fetchedAt: new Date(),
        },
      });
      newCount++;
    }
  }

  return { newCount, updatedCount };
}

export async function runIngestion(): Promise<void> {
  // Check if already running
  if (await ingestionRunService.isRunning()) {
    logger.info('Ingestion already running, skipping');
    return;
  }

  // Create run record
  const run = await ingestionRunService.createRun();
  logger.info({ runId: run.id }, 'Starting ingestion run');

  try {
    // Fetch RSS feed with retry
    const items = await withRetry(() => fetchRssFeed(), {
      maxAttempts: 3,
      initialDelayMs: 2000,
    });

    // Upsert articles
    const result = await upsertArticles(items);

    // Mark run as success
    await ingestionRunService.completeRun(
      run.id,
      'success',
      result.newCount,
      result.updatedCount
    );

    logger.info(
      {
        runId: run.id,
        newCount: result.newCount,
        updatedCount: result.updatedCount,
      },
      'Ingestion completed successfully'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Mark run as failed
    await ingestionRunService.completeRun(run.id, 'failed', 0, 0, errorMessage);

    logger.error({ runId: run.id, error: errorMessage }, 'Ingestion failed');

    // Don't rethrow - we've logged the error and recorded it
  }
}

export const collectorService = {
  runIngestion,
};
