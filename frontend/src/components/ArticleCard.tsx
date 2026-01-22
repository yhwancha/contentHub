import { formatRelativeTime } from '../lib/date';
import type { Article } from '../types/article';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="article-card">
      <h2 className="article-title">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="article-link"
        >
          {article.title}
        </a>
      </h2>
      <div className="article-meta">
        <span className="article-source">{article.source}</span>
        <span className="article-separator">·</span>
        <time
          className="article-time"
          dateTime={article.publishedAt}
          title={new Date(article.publishedAt).toLocaleString()}
        >
          {formatRelativeTime(article.publishedAt)}
        </time>
      </div>
    </article>
  );
}
