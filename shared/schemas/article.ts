import { z } from 'zod';

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  guid: z.string(),
  title: z.string().max(500),
  url: z.string().url(),
  publishedAt: z.string().datetime(),
  fetchedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Article = z.infer<typeof ArticleSchema>;

export const CreateArticleSchema = z.object({
  guid: z.string().min(1),
  title: z.string().min(1).max(500),
  url: z.string().url(),
  publishedAt: z.string().datetime(),
});

export type CreateArticle = z.infer<typeof CreateArticleSchema>;
