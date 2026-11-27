# SEO Guide for a Finance News Website and Latest-News Archive

## Goal

Make every latest-news story easy for search engines, Google News, Discover, social platforms, and readers to understand—while preserving accurate dates, authorship, source attribution, freshness, and image rights.

## Latest-news publishing priorities

For a news site, optimize in this order:

1. Publish useful, original, fact-checked reporting with a clear source.
2. Make the latest published stories discoverable from the homepage and `/market-pulse/articles`.
3. Expose accurate publication and update times in HTML, JSON-LD, and the news sitemap.
4. Make article pages fast, crawlable, mobile-friendly, and accessible without client-side JavaScript.
5. Keep author, reviewer, category, image, and source information consistent everywhere.

Never change a story's original publication date just to make it look fresh. Use `dateModified` when the story is materially updated and preserve a corrections history.

## Image previews and the `max-image-preview:large` directive

**28 Jul 2026 —** The `max-image-preview:large` robots meta tag is a directive that tells Google a page can display a large image preview. It is used within the page metadata and allows a larger preview image, up to the width of the viewport, in eligible Google Search, Google Images, Discover, and Assistant results.

For public article pages, use:

```html
<meta name="robots" content="index,follow,max-image-preview:large" />
```

In Next.js App Router:

```ts
// app/(public)/article/[slug]/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    maxImagePreview: "large",
  },
};
```

Use `noindex` for admin screens, draft previews, internal search results, login pages, and duplicate utility pages. Do not use `noindex` on a page that is blocked by `robots.txt`; Google must be able to crawl the page to see the meta directive.

## Article page metadata

Every canonical article should have:

- a unique, descriptive `<title>`;
- a short, accurate `description`;
- one canonical URL;
- `datePublished` and `dateModified` with timezone information;
- a visible headline, author/byline, and publication date;
- a relevant hero image with a stable absolute URL;
- Open Graph and Twitter/X image metadata;
- `NewsArticle` JSON-LD that matches the visible page content.

### Publishing flag

Store an explicit boolean on the article record. Prefer the past-tense name because it describes the article's current state:

```ts
published: boolean
```

If the application already uses `publish: boolean`, that is also valid—choose one name and use it consistently across the database, admin dashboard, API, metadata, and sitemap code. Do not maintain both fields unless one is a deliberate compatibility alias.

Use it as the server-side source of truth for whether an article is publicly indexable. A recommended rule is:

```ts
const isPublic = article.published && article.publishedAt <= new Date();
```

When `published` is `false`, the article should be excluded from public listings and both XML sitemaps, and its page should return `noindex` (or a `404` if it is not intended to be previewable). When `published` changes from `false` to `true`, set `publishedAt`, revalidate the article and listing pages, and add the URL to the news sitemap. When unpublishing, remove it from sitemaps and invalidate cached pages.

Do not rely only on hiding a link in the UI. Check `published` in the server query, route handler, metadata generation, structured-data generation, and sitemap generation.

Example:

```ts
export function generateMetadata({ article }: { article: Article }): Metadata {
  const url = `https://example.com/article/${article.slug}`;
  const isPublic = article.published && article.publishedAt <= new Date();

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.dek,
    alternates: { canonical: url },
    robots: {
      index: isPublic,
      follow: true,
      maxImagePreview: "large",
    },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.dek,
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.writtenBy.name],
      images: [{ url: article.heroImageUrl, width: 1200, height: 675 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.dek,
      images: [article.heroImageUrl],
    },
  };
}
```

Do not generate titles from truncated text, repeat the site name unnecessarily, or change the publication date merely to make an old story look new. Update `dateModified` only when the article materially changes.

## `NewsArticle` structured data

Add JSON-LD to each article. Google says Article structured data can help it understand the title, image, author, and dates; it is helpful but is not a requirement for eligibility in Google News features.

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: article.title,
  description: article.dek,
  image: [
    article.heroImageUrl,
    article.heroImageUrl4x3,
    article.heroImageUrl1x1,
  ].filter(Boolean),
  articleSection: article.category,
  datePublished: article.publishedAt.toISOString(),
  dateModified: article.updatedAt.toISOString(),
  author: [
    {
      "@type": "Person",
      name: article.writtenBy.name,
      url: `https://example.com/authors/${article.writtenBy.slug}`,
    },
  ],
  reviewedBy: [{
    "@type": "Person",
    name: article.reviewedBy.name,
    url: `https://example.com/authors/${article.reviewedBy.slug}`,
  }],
  publisher: {
    "@type": "Organization",
    name: "Example Finance News",
    url: "https://example.com",
    logo: {
      "@type": "ImageObject",
      url: "https://example.com/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://example.com/article/${article.slug}`,
  },
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

The structured data must describe the actual article. Do not add fake authors, dates, ratings, or images that are not visible or relevant to the page.

## News sitemap

Create `/news-sitemap.xml` in addition to the normal `/sitemap.xml`.

Include only articles published within the last two days in the news sitemap. Refresh the same sitemap as stories are published; do not create a new sitemap file for every update. Add the sitemap URL to `robots.txt` and submit it in Google Search Console.

Conceptual XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://example.com/article/market-rally</loc>
    <news:news>
      <news:publication>
        <news:name>Example Finance News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2026-07-28T08:30:00+00:00</news:publication_date>
      <news:title>Markets rally after updated inflation data</news:title>
    </news:news>
  </url>
</urlset>
```

Use the regular sitemap for evergreen articles, categories, authors, and other indexable pages. Keep admin, previews, filtered search URLs, and duplicate parameters out of all sitemaps.

## `robots.txt`

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

Do not block JavaScript, CSS, or article images that Google needs to render and understand public pages. Use page-level `noindex` for content that should not appear in search, rather than relying on `robots.txt` alone.

## Image SEO requirements

For each article hero image:

- use an original or properly licensed image;
- serve a large responsive version, ideally at least 1200px wide;
- provide `alt` text that describes the image, not a keyword list;
- use meaningful filenames and stable URLs;
- include width, height, and responsive `srcset` values;
- avoid text-heavy images when the text is important to the story;
- provide `og:image` and structured-data image URLs;
- do not block the image path in `robots.txt`;
- preserve attribution and photographer/license metadata where required.

Recommended Next.js image pattern:

```tsx
<Image
  src={article.heroImageUrl}
  alt={article.heroImageAlt}
  width={1200}
  height={675}
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
 />
```

## Finance news trust signals

Finance content needs strong editorial and transparency signals:

- persistent author profile pages with credentials and subject expertise;
- clear publication and update timestamps;
- source links and attribution for reported facts;
- corrections policy and visible correction history;
- editorial standards and contact page;
- disclosure of sponsorships, affiliations, holdings, and conflicts;
- separation between news, opinion, analysis, and sponsored content;
- no unsupported investment promises or fabricated market data.

For market data, display the source, timestamp, timezone, and whether values are real-time, delayed, or end-of-day.

## Internal linking and information architecture

Use stable, readable URLs:

```text
/article/fed-holds-rates-steady
/markets/us-stocks
/companies/apple
/topics/artificial-intelligence
/authors/jane-doe
```

Link articles to relevant companies, sectors, markets, authors, and related coverage. Keep category pages crawlable and useful; avoid generating thousands of thin tag pages with little unique content.

## Keeping Core Web Vitals low

Treat Core Web Vitals as release checks, not a final cleanup task. The practical targets are:

- **LCP:** 2.5 seconds or less
- **INP:** 200 milliseconds or less
- **CLS:** 0.1 or less

For this Next.js news site:

- render the headline, dek, byline, and first article image from the server;
- reserve image width and height to prevent layout shifts;
- use `next/image` with responsive sizes and modern formats;
- preload only the single above-the-fold hero image when it is the LCP element;
- do not lazy-load the LCP image, but lazy-load below-the-fold images;
- self-host or subset only the fonts actually used, and avoid blocking font swaps;
- keep third-party analytics, ads, embeds, and chart scripts out of the critical path;
- load ads and widgets with reserved slots so they do not move article text;
- cache published article reads and use Next.js revalidation;
- paginate related stories and comments instead of rendering large lists at once;
- avoid shipping large client-side bundles for article pages;
- measure real-user performance by template, device, and geography.

Set a CI performance budget for the homepage, category page, and article page. Verify field data in Search Console and lab data in Lighthouse or PageSpeed Insights; a good lab score alone does not prove that real readers experience good performance.

## Performance and technical SEO

- Prefer Server Components for article content and metadata.
- Use cached reads and revalidation for published stories.
- Keep the article headline and primary content in server-rendered HTML.
- Avoid requiring client-side JavaScript to reveal the article body.
- Optimize LCP images and reserve image dimensions to prevent layout shift.
- Monitor Core Web Vitals and mobile rendering in Search Console.
- Return `404` for missing articles and `410` only when content is intentionally and permanently removed.
- Redirect changed slugs with a permanent redirect and preserve the canonical URL.
- Use HTTPS everywhere and maintain one preferred host.

## Publishing checklist

Before publishing:

- [ ] headline is specific and not misleading;
- [ ] slug is short, stable, and lowercase;
- [ ] description/dek is accurate;
- [ ] author, source, publication date, and timezone are present;
- [ ] hero image has rights, alt text, dimensions, and a stable URL;
- [ ] canonical URL is correct;
- [ ] `NewsArticle` JSON-LD is present on the canonical article page;
- [ ] schema data matches the visible headline, author, image, and publication/update dates;
- [ ] `NewsArticle` schema validates in the Rich Results Test;
- [ ] page emits `max-image-preview:large`;
- [ ] article is added to the news sitemap;
- [ ] internal links and related coverage are present;
- [ ] page is indexable and not behind authentication;
- [ ] title, image, and description render correctly when shared.

## Measurement

Track weekly:

- Search Console impressions, clicks, CTR, and indexed pages;
- Google News and Discover traffic separately;
- article freshness and time to index;
- Core Web Vitals by template;
- sitemap errors and excluded URLs;
- structured-data validation errors;
- image search impressions;
- top queries by market, company, and topic;
- correction rate and content update history.

## Editorial SEO checklist

Use this checklist before publishing each article and during periodic content audits.

### 1. Internal links

- [ ] Link to at least one relevant market, company, sector, topic, or author page.
- [ ] Link to previous coverage when the article is part of an ongoing story.
- [ ] Use descriptive anchor text such as `Apple earnings` instead of `click here`.
- [ ] Confirm every internal link returns a successful response and does not redirect unnecessarily.
- [ ] Add links from important category, company, and topic pages back to the article.
- [ ] Avoid excessive links or automatically generated links that do not help readers.

### 2. Author pages and validation

- [ ] Every article has a real author or clearly labeled editorial desk.
- [ ] The byline links to a permanent author page.
- [ ] The author page includes a name, biography, expertise, profile image where appropriate, and published work.
- [ ] Author pages are indexable only when they contain useful original information and a meaningful article list.
- [ ] Thin or empty author pages use `noindex` until they have enough content.
- [ ] The `NewsArticle` schema author matches the visible byline and links to the author profile.
- [ ] Validate the article page and author page with the Rich Results Test and URL Inspection tool.
- [ ] Check that structured data contains no placeholder names, broken URLs, or dates that disagree with the page.

### 3. Unique human insight

- [ ] The article adds original reporting, analysis, context, interviews, calculations, or clearly stated editorial judgment.
- [ ] The opening explains why the story matters to the reader now.
- [ ] Market claims identify the source, time, geography, and relevant comparison period.
- [ ] The article distinguishes reported facts from analysis, opinion, forecasts, and speculation.
- [ ] AI-assisted drafts are edited by a human who verifies facts, numbers, quotes, links, and attribution.
- [ ] The story contains enough specific detail that it does not read like a generic rewrite of another publisher's article.
- [ ] Add a visible methodology, data source, or editor's note when the article uses calculations or interpretation.
- [ ] Do not manufacture a personal experience, source, quote, or expert opinion to create a false impression of human authorship.

### 4. Breadcrumbs

- [ ] Show a visible breadcrumb trail on article and deep category pages.
- [ ] Keep the order consistent: `Home → Section → Topic or Company → Article`.
- [ ] Link each breadcrumb level to a useful canonical page.
- [ ] Mark up the visible breadcrumb trail with `BreadcrumbList` JSON-LD.
- [ ] Use the same names and URLs in the visible breadcrumbs and structured data.
- [ ] Do not include the current article as a clickable breadcrumb if the design does not need it.

Example:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "Markets", "item": "https://example.com/markets" },
    { "@type": "ListItem", "position": 3, "name": "Article" }
  ]
}
```

### 5. Images

- [ ] Use an original, licensed, or properly attributed image.
- [ ] Use an image that directly supports the story rather than a generic decorative image.
- [ ] Provide accurate, descriptive `alt` text; do not stuff keywords into it.
- [ ] Use a stable absolute image URL in the page, Open Graph metadata, and `NewsArticle` schema.
- [ ] Provide responsive sizes and dimensions, preferably with `next/image`.
- [ ] Use a large, high-quality hero image suitable for `max-image-preview:large`.
- [ ] Preload only the likely LCP image and lazy-load below-the-fold images.
- [ ] Reserve image dimensions to prevent cumulative layout shift.
- [ ] Confirm Googlebot can crawl the image URL and that `robots.txt` does not block it.
- [ ] Preserve photographer, licensing, and attribution information where required.
- [ ] Use meaningful filenames and captions when they add editorial context.

### Final pre-publish check

- [ ] The article is genuinely useful without relying on search-engine markup.
- [ ] The canonical URL, title, description, author, dates, image, breadcrumbs, and `NewsArticle` schema all agree.
- [ ] The article is linked from an appropriate section or topic page.
- [ ] The article has no placeholder text, fake data, broken links, or empty author references.
- [ ] The page is fast on mobile and meets the Core Web Vitals targets documented above.

## Latest articles / Market Pulse page

A route such as `/market-pulse/articles` is a useful editorial archive and discovery page. It gives readers one canonical place to browse the newest finance stories, while giving search engines a crawlable internal hub for recently published articles. The referenced Multibagg AI page uses this pattern as a Market Pulse section with an articles sub-section and a searchable list of stock-market news and analysis. [Example Market Pulse articles page](https://www.multibagg.ai/market-pulse/articles)

Use this page when the product includes market coverage, company updates, price movements, earnings, and investment analysis. If the site is only a general news publication, `/articles` or `/latest` may be a clearer route. The route should not exist merely to create another thin page.

Recommended route:

```text
/market-pulse/articles
```

Recommended behavior:

- show real published articles ordered by `publishedAt DESC`;
- exclude `published: false` and future-dated articles;
- provide pagination or cursor-based loading instead of one enormous page;
- support useful filters such as section, company, sector, and date;
- use canonical URLs for filtered pages and avoid indexing low-value query combinations;
- link each card to its canonical article URL;
- link the page from the main navigation and relevant market/category pages;
- include a descriptive title such as `Latest Market News and Analysis`;
- include a short introduction explaining what readers will find;
- use `ItemList` schema only when it accurately represents the visible article list;
- include the page in the regular sitemap, but not the news sitemap;
- do not include demo, fabricated, placeholder, or unpublished articles.

Example metadata:

```ts
export const metadata: Metadata = {
  title: "Latest Market News and Analysis",
  description:
    "The latest published market news, company updates, earnings coverage, and finance analysis.",
  alternates: {
    canonical: "https://example.com/market-pulse/articles",
  },
};
```

The latest-articles page is an archive and navigation hub, not a replacement for individual article pages. Each article still needs its own canonical URL, visible author and dates, image metadata, breadcrumbs, and `NewsArticle` structured data.

### Functional page inventory from the reference pattern

The reference page is a market-research product shell around a public articles archive. The useful implementation details are the functions and information architecture, not the reference site's exact copy or article data.

| Area | Functional behavior | SEO verification |
|---|---|---|
| Global header | Brand, primary product navigation, pricing/help links, and login/register entry point. | [ ] All important public destinations use crawlable HTML links. |
| Auth boundary | Personalized tools such as portfolio, alerts, watchlists, and dashboards can require login; public articles remain readable without login. | [ ] Article pages do not require login. [ ] Private screens use `noindex`. |
| Market Pulse navigation | A parent Market Pulse area groups market overview, institutional activity, corporate actions, and articles. | [ ] Parent and child pages have stable canonical URLs. |
| Secondary navigation | Deep-research areas can include earnings, sectors, industries, company analysis, and market discovery. | [ ] Navigation labels match useful landing pages; no empty destinations. |
| Page heading | One clear H1 states that the page contains market news and analysis. | [ ] Exactly one descriptive H1. |
| Intro copy | A short explanation sets expectations for market news, company updates, price movements, earnings, and analysis. | [ ] Copy is original and useful, not keyword repetition. |
| Article search | Search field filters the article collection by title, company, market, or topic. | [ ] Search results have a useful empty state. [ ] Low-value query URLs are not indexed. |
| Category filter | An `All` state and category states filter the visible article list. | [ ] Category pages have unique titles/descriptions. [ ] Do not index every thin filter combination. |
| Article list | Cards show headline, short summary, publication date, and estimated reading time; each card links to the canonical article. | [ ] Cards use real `published: true` records only. [ ] Links are server-rendered. |
| Freshness | Newest stories appear first, based on publication time rather than update time. | [ ] Dates include a timezone in data and are visible to readers. |
| Pagination | Older results are loaded through a next-page link or cursor pagination. | [ ] Pages are crawlable and have unique URLs. [ ] Avoid infinite scroll with no accessible fallback. |
| Article detail | The detail page contains headline, byline, review attribution, date, body, source attribution, image, breadcrumbs, and related links. | [ ] `NewsArticle` and `BreadcrumbList` schema match visible content. |
| Footer | Repeats major product groups and includes legal, company, contact, social, and sitemap links. | [ ] Legal and editorial policy pages are linked. [ ] No dead footer links. |
| Trust notice | Market-data delay, AI limitations, and investment-risk disclaimers are visible where relevant. | [ ] Disclaimers are clear without obscuring the article content. |

Recommended implementation flow:

1. Load only `published = true` and `publishedAt <= now` articles from PostgreSQL.
2. Apply category and search filters on the server for the initial request.
3. Return a stable cursor or page URL for older results.
4. Render each card as a normal internal link to `/article/[slug]`.
5. Revalidate the archive after a publish or unpublish action.
6. Keep private tools behind authentication and keep public editorial pages independently crawlable.

Do not copy the reference site's article titles, summaries, authors, images, branding, or proprietary content. Recreate the functional pattern with the publication's own editorial data and design system.

## Page hierarchy

```text
/
├── /market-pulse
│   ├── /market-pulse/articles       Latest published articles
│   ├── /market-pulse/markets        Market overview
│   ├── /market-pulse/companies      Company coverage
│   ├── /market-pulse/sectors        Sector coverage
│   └── /market-pulse/earnings       Earnings coverage
├── /article/[slug]                  Canonical article page
├── /authors/[slug]                  Author profile and article archive
├── /markets/[slug]                  Market or index landing page
├── /companies/[slug]                Company landing page
├── /topics/[slug]                   Topic landing page
├── /search                          Search results; normally noindex
├── /admin                           Authenticated editorial dashboard; noindex
├── /sitemap.xml                     General sitemap
├── /news-sitemap.xml                Recent news URLs only
└── /robots.txt                      Crawl directives and sitemap links
```

Hierarchy verification:

| Check | Verified |
|---|---|
| Every published article is reachable from latest articles, a category, an author page, or related coverage | [ ] |
| Every article has one canonical `/article/[slug]` URL | [ ] |
| Category, company, market, topic, and author pages have useful unique content | [ ] |
| Breadcrumbs reflect the hierarchy and link to parent pages | [ ] |
| Search, admin, preview, and low-value filter combinations are not indexed | [ ] |
| Homepage links to latest articles and important current categories | [ ] |
| Regular sitemap includes indexable hierarchy pages | [ ] |
| News sitemap includes only recent published articles | [ ] |

## Official references

- [Google: Robots meta tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: Create a news sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
- [Google: Meta tags and attributes supported by Google](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Google: Subscription and paywalled content](https://developers.google.com/search/docs/appearance/structured-data/paywalled-content)

*Status: initial SEO implementation guide for the finance news website. Recheck Google Search Central documentation before launch because search features and eligibility guidance can change.*
