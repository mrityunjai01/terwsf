import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/src/lib/articles";
import { site } from "@/src/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getPublishedArticles().map((article) => ({ url: `${site.url}/article/${article.slug}`, lastModified: article.updatedAt, changeFrequency: "daily" as const, priority: 0.8 }));
  return [{ url: site.url, lastModified: new Date(), changeFrequency: "hourly", priority: 1 }, ...articles];
}
