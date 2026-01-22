import { prisma } from '../lib/prisma.js';
import { decodeCursor, createCursor } from '../lib/cursor.js';
import type { Article } from '@prisma/client';

export interface ArticleListResult {
  articles: Article[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function findMany(
  cursor?: string,
  limit: number = 20
): Promise<ArticleListResult> {
  const take = Math.min(limit, 50);
  const decodedCursor = cursor ? decodeCursor(cursor) : null;

  const whereClause = decodedCursor
    ? {
        OR: [
          {
            publishedAt: { lt: new Date(decodedCursor.publishedAt) },
          },
          {
            publishedAt: new Date(decodedCursor.publishedAt),
            id: { lt: decodedCursor.id },
          },
        ],
      }
    : undefined;

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: take + 1, // Fetch one extra to check if there are more
  });

  const hasMore = articles.length > take;
  const resultArticles = hasMore ? articles.slice(0, take) : articles;

  const lastArticle = resultArticles[resultArticles.length - 1];
  const nextCursor =
    hasMore && lastArticle
      ? createCursor(lastArticle.publishedAt, lastArticle.id)
      : null;

  return {
    articles: resultArticles,
    nextCursor,
    hasMore,
  };
}

export async function findById(id: string): Promise<Article | null> {
  return prisma.article.findUnique({
    where: { id },
  });
}

export const articleService = {
  findMany,
  findById,
};
