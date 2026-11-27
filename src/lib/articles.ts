import type { Article } from "@/src/types/article";

// Content is intentionally empty until the PostgreSQL/Drizzle repository is connected.
const articles: Article[] = [];

export function isPublicArticle(article: Article, now = new Date()) {
  return article.published && article.publishedAt <= now;
}

export function getPublishedArticles() {
  return articles.filter(isPublicArticle).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getAllArticles() {
  return articles;
}
