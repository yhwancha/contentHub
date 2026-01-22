export interface Article {
  id: string;
  source: string;
  guid: string;
  title: string;
  url: string;
  publishedAt: string;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  articles: Article[];
  nextCursor: string | null;
  hasMore: boolean;
}
