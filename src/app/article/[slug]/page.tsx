import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles, isPublicArticle } from "@/src/lib/articles";
import { site } from "@/src/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export function generateStaticParams() { return getPublishedArticles().map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found", robots: { index: false, follow: false } };
  const publicArticle = isPublicArticle(article);
  const url = `${site.url}/article/${article.slug}`;
  return { title: article.seoTitle ?? article.title, description: article.seoDescription ?? article.dek, alternates: { canonical: url }, robots: { index: publicArticle, follow: true, "max-image-preview": "large" }, openGraph: { type: "article", url, title: article.title, description: article.dek, publishedTime: article.publishedAt.toISOString(), modifiedTime: article.updatedAt.toISOString(), authors: [article.writtenBy.name], images: [{ url: article.heroImageUrl, width: 1600, height: 900, alt: article.heroImageAlt }] }, twitter: { card: "summary_large_image", title: article.title, description: article.dek, images: [article.heroImageUrl] } };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article || !isPublicArticle(article)) notFound();
  const url = `${site.url}/article/${article.slug}`;
  const jsonLd = { "@context": "https://schema.org", "@type": article.articleType, headline: article.title, description: article.dek, articleSection: article.category, image: [article.heroImageUrl], datePublished: article.publishedAt.toISOString(), dateModified: article.updatedAt.toISOString(), author: [{ "@type": "Person", name: article.writtenBy.name, url: `${site.url}/authors/${article.writtenBy.slug}` }], reviewedBy: [{ "@type": "Person", name: article.reviewedBy.name, url: `${site.url}/authors/${article.reviewedBy.slug}` }], publisher: { "@type": "Organization", name: site.name, url: site.url }, mainEntityOfPage: { "@type": "WebPage", "@id": url } };
  return <main className="page"><article className="article"><header className="article-header"><div className="eyebrow">{article.category}</div><h1>{article.title}</h1><p className="dek">{article.dek}</p><div className="meta">Written by {article.writtenBy.name} · Reviewed by {article.reviewedBy.name} · Published {article.publishedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · Updated {article.updatedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div></header><Image className="article-hero" src={article.heroImageUrl} alt={article.heroImageAlt} width={1600} height={900} priority sizes="(max-width: 820px) 100vw, 820px" /><div className="article-body">{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><p className="source">Source: <a href={article.sourceUrl} rel="nofollow noopener">{article.sourceName}</a></p><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></article></main>;
}
