import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { articleService } from '../services/article.service.js';
import { logger } from '../lib/logger.js';

const router = Router();

const ListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// GET /api/articles - List articles with cursor pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = ListQuerySchema.parse(req.query);
    const result = await articleService.findMany(query.cursor, query.limit);

    const response = {
      articles: result.articles.map((article) => ({
        id: article.id,
        source: article.source,
        guid: article.guid,
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt.toISOString(),
        fetchedAt: article.fetchedAt.toISOString(),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: error.errors,
      });
      return;
    }

    logger.error({ error }, 'Failed to list articles');
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch articles',
    });
  }
});

// GET /api/articles/:id - Get single article by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await articleService.findById(id);

    if (!article) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Article not found',
      });
      return;
    }

    res.json({
      id: article.id,
      source: article.source,
      guid: article.guid,
      title: article.title,
      url: article.url,
      publishedAt: article.publishedAt.toISOString(),
      fetchedAt: article.fetchedAt.toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error, id: req.params.id }, 'Failed to get article');
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch article',
    });
  }
});

export default router;
