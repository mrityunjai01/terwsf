import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Article Template Reference",
  robots: { index: false, follow: false },
};

/**
 * Noindex structural reference for the article template described in
 * ARTICLE_TEMPLATE_REFERENCE.md. It intentionally contains no demo article,
 * author, market, image, or source data.
 */
export default function ReferenceArticlePage() {
  return (
    <main>
      <nav aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/market-pulse">Market Pulse</a></li>
          <li><a href="/market-pulse/articles">Articles</a></li>
          <li aria-current="page">Article template</li>
        </ol>
      </nav>

      <article>
        <header>
          <p>Category</p>
          <h1>Article template</h1>
          <p>Written by Author · Reviewed by Reviewer · Published date · Updated date · Reading time</p>
        </header>

        <section aria-labelledby="highlights-heading">
          <h2 id="highlights-heading">Key highlights</h2>
          <ul><li>Published article highlight.</li><li>Verified source-based highlight.</li><li>Reader-relevant takeaway.</li></ul>
        </section>

        <section aria-label="Article body">
          <h2>Article section</h2>
          <p>Article content is loaded from the PostgreSQL and Drizzle repository when a published record is available.</p>
        </section>

        <section aria-labelledby="data-heading">
          <h2 id="data-heading">Data and timeline</h2>
          <table><caption>Published article data</caption><thead><tr><th>Item</th><th>Detail</th></tr></thead><tbody><tr><td>Source data</td><td>Loaded from verified article records</td></tr></tbody></table>
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading">Frequently asked questions</h2>
          <details><summary>What does this article explain?</summary><p>The answer is supplied from the published article record.</p></details>
        </section>
      </article>
    </main>
  );
}
