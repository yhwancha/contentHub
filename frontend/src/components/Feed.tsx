import { useEffect } from 'react';
import { ArticleCard } from './ArticleCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useInfiniteArticles } from '../services/articles';

export function Feed() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteArticles();

  const { targetRef, isIntersecting } = useIntersectionObserver();

  // Fetch next page when scroll trigger is visible
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Initial loading state
  if (isLoading) {
    return (
      <div className="feed">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="feed">
        <ErrorState
          message={error?.message || 'Failed to load articles'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Flatten all pages into single articles array
  const articles = data?.pages.flatMap((page) => page.articles) ?? [];

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="feed">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="feed">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={targetRef} className="scroll-trigger">
        {isFetchingNextPage && <LoadingSpinner />}
        {!hasNextPage && articles.length > 0 && (
          <p className="end-of-feed">You&apos;ve reached the end</p>
        )}
      </div>
    </div>
  );
}
