export type Author = {
  name: string;
  slug: string;
  bio?: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string[];
  section: string;
  articleType: "NewsArticle" | "AnalysisNewsArticle" | "OpinionNewsArticle" | "ReportageNewsArticle";
  category: "Markets" | "Companies" | "Technology" | "Economy" | "Policy";
  writtenBy: Author;
  reviewedBy: Author;
  sourceName: string;
  sourceUrl: string;
  heroImageUrl: string;
  heroImageAlt: string;
  published: boolean;
  publishedAt: Date;
  updatedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
};
