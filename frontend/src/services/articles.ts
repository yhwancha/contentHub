import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchApi, buildQueryString } from './api';
import type { ArticleListResponse } from '../types/article';

interface FetchArticlesParams {
  cursor?: string;
  limit?: number;
}

async function fetchArticles(params: FetchArticlesParams = {}): Promise<ArticleListResponse> {
  const queryString = buildQueryString({
    cursor: params.cursor,
    limit: params.limit,
  });
  return fetchApi<ArticleListResponse>(`/api/articles${queryString}`);
}

export function useArticles(params: FetchArticlesParams = {}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => fetchArticles(params),
  });
}

export function useInfiniteArticles(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: ['articles', 'infinite', limit],
    queryFn: ({ pageParam }) => fetchArticles({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
