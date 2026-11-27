# Finance Article Template — Functional and SEO Reference

This document describes the functional and SEO structure observed in the referenced market-news article pattern. It is an implementation specification, not a copy of the reference article’s text, data, branding, images, or proprietary content.

Reference pattern: `/market-pulse/articles/[slug]`

## Article page hierarchy

```text
Global header
└── Market Pulse navigation
    └── Articles archive
        └── Breadcrumbs
            └── Article page
                ├── Category / topic label
                ├── H1 headline
                ├── Written by / reviewed by / date / read time
                ├── Hero image and image metadata
                ├── Key highlights
                ├── Article body with H2 sections
                ├── Data table or timeline when useful
                ├── Conclusion / investor takeaway
                ├── FAQ section
                ├── Source attribution and related links
                └── Footer and legal/trust links
```

## Functional structure

| Area | Function | Implementation requirement | Verified |
|---|---|---|---|
| Global header | Brand, navigation, login/account entry, and product sections | Use shared site layout and crawlable internal links | [ ] |
| Breadcrumbs | Shows the path from Market Pulse to Articles to the current story | Render visible `BreadcrumbList` JSON-LD matching the links | [ ] |
| Category label | Identifies the story topic, such as Markets, Companies, or Policy | Link to the canonical category page | [ ] |
| Headline | States the article’s specific news event or analysis | One descriptive H1; use the same value in `NewsArticle.headline` | [ ] |
| Trust line | Separates `Written by` and `Reviewed by` | Both authors must be selected from approved constants and have author pages | [ ] |
| Freshness line | Shows published date, updated date, timezone, and reading time | Keep `datePublished` and `dateModified` accurate and machine-readable | [ ] |
| Hero image | Establishes visual context and supports social/search previews | Use licensed image, alt text, dimensions, Open Graph image, and schema image | [ ] |
| Share actions | Supports WhatsApp/social sharing and copy-link behavior | Keep actions client-side; retain a normal canonical URL for crawlers | [ ] |
| Key highlights | Summarizes the most important facts before the full story | Use 3–5 factual bullets; do not duplicate misleading claims | [ ] |
| Article body | Explains the event with evidence and context | Use semantic paragraphs, H2 sections, links, and source references | [ ] |
| Data table | Presents dates, figures, claims, prices, or process milestones | Use real accessible HTML `<table>` markup with a caption | [ ] |
| Related research CTA | Links to company, market, valuation, or deeper-research tools | Mark product CTAs clearly and avoid interrupting the main article | [ ] |
| Conclusion | Gives a concise, evidence-based takeaway | Label analysis or interpretation clearly | [ ] |
| FAQ | Answers high-intent questions about the story | Use visible questions and answers; add FAQ schema only when eligible and accurate | [ ] |
| Source attribution | Links to filings, exchanges, tribunals, company releases, or licensed feeds | Preserve source name, URL, publication date, and retrieval context | [ ] |
| Related articles | Helps readers continue to relevant coverage | Use server-rendered internal links based on category, entity, and topic | [ ] |
| Footer | Provides legal, editorial policy, contact, sitemap, and social links | Include trust and correction-policy links | [ ] |

## Required article data

```ts
type ArticleRecord = {
  slug: string;
  title: string;
  dek: string;
  articleType: "NewsArticle" | "AnalysisNewsArticle" | "OpinionNewsArticle" | "ReportageNewsArticle";
  category: "Markets" | "Companies" | "Technology" | "Economy" | "Policy";
  writtenByAuthorSlug: string;
  reviewedByAuthorSlug: string;
  published: boolean;
  publishedAt: Date;
  updatedAt: Date;
  readingTimeMinutes: number;
  heroImageUrl: string;
  heroImageAlt: string;
  sourceName: string;
  sourceUrl: string;
};
```

Only records with `published = true` and a publication time in the past should render publicly, appear in internal latest-article links, or enter a sitemap.

## SEO output

Each public article page should render:

```html
<title>Article headline | Site name</title>
<meta name="description" content="Accurate article summary." />
<meta name="robots" content="index,follow,max-image-preview:large" />
<link rel="canonical" href="https://example.com/article/article-slug" />
<meta property="og:type" content="article" />
<meta property="og:title" content="Article headline" />
<meta property="og:description" content="Accurate article summary." />
<meta property="og:image" content="https://example.com/images/article.jpg" />
```

Structured data should include:

- `NewsArticle` or the selected article subtype;
- `headline`, `description`, and `image`;
- `datePublished` and `dateModified`;
- `author` pointing to the written-by author page;
- `reviewedBy` pointing to the reviewer author page;
- `articleSection` equal to the visible category;
- `publisher` and publisher logo;
- `mainEntityOfPage` equal to the canonical article URL;
- `BreadcrumbList` matching the visible breadcrumbs.

## Schema by article type and category

The page should select schema from editorial metadata rather than infer it from the URL:

| Editorial value | Schema value | Typical use |
|---|---|---|
| `NewsArticle` | `NewsArticle` | Reported company, market, regulatory, or economic development | 
| `AnalysisNewsArticle` | `AnalysisNewsArticle` | Reported facts plus clearly labeled interpretation | 
| `OpinionNewsArticle` | `OpinionNewsArticle` | Signed opinion or editorial viewpoint | 
| `ReportageNewsArticle` | `ReportageNewsArticle` | Original reporting, interviews, or field reporting | 

`articleSection` should come from the controlled category list: Markets, Companies, Technology, Economy, or Policy. The visible label, database value, URL taxonomy, and JSON-LD value must agree.

## Performance requirements

- Keep the headline, trust line, key highlights, and first paragraph in server-rendered HTML.
- Preload only the likely LCP hero image and provide width/height to avoid layout shift.
- Lazy-load below-the-fold images, related content, embeds, and nonessential widgets.
- Defer share widgets, analytics, ads, and research tools until after the primary content is usable.
- Keep the article body readable without client-side JavaScript.
- Track LCP, INP, and CLS for article pages separately from the archive page.

## News sitemap

Expose `/news-sitemap.xml` for recent published articles. Google requires each news sitemap to contain no more than **1,000 `news:news` entries**. If more than 1,000 eligible articles are published in the window, split them into multiple sitemap files and expose them through a sitemap index.

Google's current guidance is to include only articles created in the last **two days**. Therefore, use a 48-hour eligibility cutoff. If the product requirement says “three-day purge,” treat that as an operational cleanup guarantee: remove entries no later than 72 hours, but never keep an article in the Google News sitemap beyond the stricter 48-hour eligibility window.

Each entry must contain:

- the canonical article URL;
- the exact publication name;
- an ISO 639 language code;
- the original publication timestamp, including timezone;
- the article title as displayed on the page.

Do not include drafts, future-dated records, duplicate URLs, private previews, or article updates with a changed sitemap date that is not the original publication date. Refresh the same sitemap as new articles are published; do not create a new sitemap file for every article.

Example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://example.com/article/article-slug</loc>
    <news:news>
      <news:publication>
        <news:name>Example Finance News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2026-11-26T08:30:00+00:00</news:publication_date>
      <news:title>Article headline</news:title>
    </news:news>
  </url>
</urlset>
```

## `robots.txt` requirements

Allow public article, category, author, image, CSS, and JavaScript resources. Block private application routes and utility endpoints that should not be crawled.

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /preview/
Disallow: /search?

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/news-sitemap.xml
```

Robots rules are not an access-control mechanism. Protect admin and API routes with authentication and authorization. Use page-level `noindex` for pages that may be crawled but should not appear in search. Do not block an article with `robots.txt` and expect Google to read its `noindex` or other robots metadata. Keep article images crawlable when they are used in `NewsArticle` or Open Graph metadata.

Verification checklist:

- [ ] `/news-sitemap.xml` contains at most 1,000 news entries per file.
- [ ] Articles older than 48 hours are removed from the news sitemap.
- [ ] A cleanup job guarantees removal within 72 hours as an operational safety check.
- [ ] Only `published = true` and past-dated articles are included.
- [ ] `robots.txt` lists both the regular and news sitemap.
- [ ] Admin, preview, API, and search routes are not crawl targets.
- [ ] Public article URLs and their images are not accidentally disallowed.
- [ ] Sitemap and robots output are checked in Google Search Console.

## Editorial and legal requirements

- Verify every number, date, legal reference, quote, and source URL.
- Distinguish reported facts, source claims, analysis, and forward-looking statements.
- Do not invent an author, reviewer, source, image, or human insight.
- Add corrections history when published information changes.
- Add finance-specific disclaimers where content could be interpreted as investment advice.
- Keep copyrighted source material summarized and attributed rather than reproduced.

## Reference implementation status

- [ ] Connect the page to PostgreSQL through Drizzle.
- [ ] Add the five approved authors from `src/lib/authors.ts`.
- [ ] Add `writtenBy` and `reviewedBy` database relations.
- [ ] Add reading-time calculation from article body length.
- [ ] Add breadcrumb component and JSON-LD.
- [ ] Add related-article query based on category/entity/topic.
- [ ] Add accessible tables and FAQ rendering.
- [ ] Validate metadata and schema with Rich Results Test and URL Inspection.

