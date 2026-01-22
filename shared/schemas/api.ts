import { z } from 'zod';
import { ArticleSchema } from './article.js';

export const ArticleListResponseSchema = z.object({
  articles: z.array(ArticleSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type ArticleListResponse = z.infer<typeof ArticleListResponseSchema>;

export const ArticleListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ArticleListQuery = z.infer<typeof ArticleListQuerySchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const PaginationCursorSchema = z.object({
  publishedAt: z.string().datetime(),
  id: z.string().uuid(),
});

export type PaginationCursor = z.infer<typeof PaginationCursorSchema>;
