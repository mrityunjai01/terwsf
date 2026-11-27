import { getPublishedArticles } from "@/src/lib/articles";
import { site } from "@/src/lib/site";

function escapeXml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;"); }

export function GET() {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const articles = getPublishedArticles()
    .filter((article) => article.publishedAt.getTime() >= cutoff)
    .slice(0, 1000);
  const urls = articles.map((article) => `<url><loc>${escapeXml(`${site.url}/article/${article.slug}`)}</loc><news:news><news:publication><news:name>${escapeXml(site.name)}</news:name><news:language>en</news:language></news:publication><news:publication_date>${article.publishedAt.toISOString()}</news:publication_date><news:title>${escapeXml(article.title)}</news:title></news:news></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
