import Parser from 'rss-parser';
import { logger } from './logger.js';

const RSS_FEED_URL = process.env.RSS_FEED_URL || 'https://news.hada.io/rss/news';
const RSS_FETCH_TIMEOUT_MS = parseInt(process.env.RSS_FETCH_TIMEOUT_MS || '30000', 10);

interface RssItem {
  guid: string;
  title: string;
  url: string;
  publishedAt: Date;
}

const parser = new Parser({
  timeout: RSS_FETCH_TIMEOUT_MS,
  headers: {
    'User-Agent': 'ContentHub/1.0 (RSS Feed Aggregator)',
  },
  customFields: {
    item: ['published'],
  },
});

export async function fetchRssFeed(): Promise<RssItem[]> {
  logger.info({ url: RSS_FEED_URL }, 'Fetching RSS feed');

  const feed = await parser.parseURL(RSS_FEED_URL);

  const items: RssItem[] = [];

  for (const item of feed.items) {
    // Skip items without required fields
    if (!item.title || !item.link) {
      logger.warn({ item }, 'Skipping malformed RSS item');
      continue;
    }

    // Use id (guid) or link as fallback
    const guid = item.id || item.guid || item.link;

    // Parse published date
    const publishedStr = item.published || item.pubDate || item.isoDate;
    const publishedAt = publishedStr ? new Date(publishedStr) : new Date();

    items.push({
      guid,
      title: item.title.trim(),
      url: item.link,
      publishedAt,
    });
  }

  logger.info({ count: items.length }, 'Parsed RSS feed items');
  return items;
}
