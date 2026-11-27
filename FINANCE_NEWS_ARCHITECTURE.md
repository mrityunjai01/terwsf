# Finance News Website — Technical Architecture

## Recommendation in brief

Use **Next.js + PostgreSQL + Drizzle ORM + a custom admin dashboard**, deployed on Vercel.

- **Vercel:** frontend, server-rendered pages, API/Server Actions, previews, and cron-triggered jobs.
- **PostgreSQL:** Supabase PostgreSQL, accessed through the Supabase transaction pooler at runtime and a direct connection for Drizzle migrations.
- **Drizzle:** typed schema, queries, and versioned migrations.
- **Admin dashboard:** custom authenticated area for editorial workflows, ingestion, moderation, and publishing.
- **Terraform:** the infrastructure-as-code layer for Vercel project configuration, domains, environment variables, and deployment settings.

## Does Vercel support Terraform?

Yes. Vercel provides an official Terraform provider that can manage projects, deployments, domains, environment variables, and related configuration. Terraform is especially useful when Vercel is one part of a larger stack containing AWS, Cloudflare, GitHub, or other services.

For this site, use Terraform for:

- Vercel project and team association
- Git repository and production branch configuration
- preview/production environment variables
- custom domains and aliases
- deployment settings and protected environments
- related cloud resources that are not provisioned directly by Vercel

This repository adopts Terraform from the beginning so Vercel configuration is repeatable across preview and production. The Vercel dashboard can still be used for read-only inspection and emergency diagnosis, but changes to managed resources should go through Terraform.

Keep secrets out of `.tf` files and state where possible. Store Terraform state in a secure remote backend, use CI for plans/applies, and review changes before applying them.

## PostgreSQL on Vercel

New Vercel projects should connect to an external managed Postgres provider through the **Vercel Marketplace**. Vercel Postgres is no longer available for new projects; existing Vercel Postgres databases were migrated to Neon.

This project uses **Supabase** as the managed Postgres provider. Supabase can later provide Auth, Storage, Realtime, or Edge Functions, but the current application accesses the database through Drizzle.

The provider should inject a connection string into Vercel environment variables. Use separate databases or branches for local development, previews, and production. Do not expose the database URL to the browser.

### Connection guidance

Vercel functions are short-lived and can scale horizontally. Use the provider’s serverless driver or pooled connection URL, and avoid creating an unbounded traditional database connection pool per invocation. Keep the database region close to the Vercel compute region to reduce latency.

For read-heavy news pages:

- cache public article and category pages with Next.js revalidation;
- use indexed queries and cursor pagination;
- use a separate cache or queue later if ingestion becomes bursty;
- keep writes and admin mutations on the Node.js runtime when the selected driver requires it.

## Drizzle ORM

Drizzle is a good fit for this stack because it provides typed SQL-oriented queries with a small runtime footprint.

Suggested scripts:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

Use `drizzle-kit push` for quick local experimentation only. Commit generated migrations and run `drizzle-kit migrate` in a controlled deployment or release step. Production schema changes should be backward-compatible with the currently deployed application.

Example connection shape:

```ts
// src/db/client.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  prepare: false,
  ssl: "require",
});
export const db = drizzle(sql);
```

Keep the database client in a server-only module and import it from Server Components, Route Handlers, Server Actions, or background jobs—not client components. `DATABASE_URL` is the Supabase transaction-pooler URL for Vercel runtime traffic. `DIRECT_URL` is reserved for Drizzle migrations and CI.

## Core data model

Minimum tables:

- `users` — admin identity and role
- `articles` — title, slug, dek, body, status, published timestamp, author, source, and SEO fields
- `article_revisions` — editorial history and rollback support
- `categories` — markets, companies, technology, policy, and other sections
- `article_categories` — many-to-many article classification
- `tags` — symbols, sectors, topics, and entities
- `article_tags` — many-to-many tagging
- `sources` — publisher, source URL, attribution, and ingestion metadata
- `ingestion_items` — raw feed/API records, deduplication key, processing status, and error information
- `audit_logs` — admin actions, actor, target, timestamp, and metadata

Use unique indexes for `articles.slug`, canonical source URLs, and ingestion deduplication keys. Index `status`, `published_at`, `category`, and commonly filtered market/entity fields.

## Public website

Recommended Next.js areas:

- `/` — latest and featured market news
- `/markets/[slug]` — market or sector landing pages
- `/article/[slug]` — article detail pages
- `/search` — indexed article search
- `/authors/[slug]` — author pages
- `/api/og/[slug]` — social image generation

Use Server Components for article reads, metadata, and SEO. Use client components only for interactive filters, watchlists, charts, and admin-like controls. Revalidate published content after an admin publish action rather than making every request uncached.

## Custom admin dashboard

The dashboard should be a first-class application area under `/admin`, protected by authentication and role-based authorization.

Initial screens:

- editorial queue: draft, review, scheduled, published, rejected
- article editor with autosave and preview
- source and ingestion monitor
- taxonomy management for categories, tags, and entities
- user and role management
- audit log and failed-job review

Keep authorization checks on the server for every mutation. A hidden admin route is not a security boundary. Use CSRF-safe server actions or authenticated route handlers, validate all input, and record publish/unpublish actions in `audit_logs`.

## Content ingestion

Use a separate ingestion flow for RSS feeds, licensed APIs, or internal research. Store the original payload and source attribution before transforming it into an article. Deduplicate by source ID or canonical URL, then run normalization, classification, editorial review, and publishing as separate states.

Avoid scraping or republishing material without confirming source licenses and financial-news compliance requirements. AI-assisted summaries should remain reviewable and should not replace attribution or editorial approval.

## Deployment shape

```text
Readers ──> Vercel CDN / Next.js
                 │
                 ├── public pages ──> PostgreSQL (read + cache)
                 ├── /admin ────────> PostgreSQL (authenticated writes)
                 └── cron/jobs ────> ingestion API/feed ──> PostgreSQL

Terraform ──> Vercel project, domains, runtime environments, and deployment settings
Drizzle Kit ─> Supabase schema migrations via DIRECT_URL
```

Suggested environments:

- **Local:** local Postgres or a disposable provider branch
- **Preview:** isolated database branch or non-production database
- **Production:** protected managed Postgres database with backups and monitoring

## Operational checklist

- Configure `DATABASE_URL` separately for local, preview, and production.
- Use pooled/serverless database connectivity appropriate for Vercel functions.
- Run migrations as a release step; do not run schema mutation on every request.
- Add backups, retention, and restore testing at the database provider.
- Restrict admin access with strong authentication and least-privilege roles.
- Add rate limiting to login, ingestion, search, and mutation endpoints.
- Monitor query latency, function duration, database connections, failed ingestion, and publish errors.
- Add canonical URLs, structured metadata, sitemap generation, and RSS output for discoverability.

## Source links

- [Vercel: Integrating Terraform with Vercel](https://vercel.com/kb/guide/integrating-terraform-with-vercel)
- [Vercel: Postgres on Vercel](https://vercel.com/docs/postgres)
- [Vercel: Marketplace storage integrations](https://vercel.com/docs/marketplace-storage)
- [Drizzle: Postgres with Vercel](https://orm.drizzle.team/docs/tutorials/drizzle-with-vercel)
- [Vercel: Postgres + Drizzle Next.js starter](https://vercel.com/templates/next.js/postgres-drizzle)

*Status: initial technical direction; provider, authentication, ingestion sources, and compliance requirements should be confirmed before implementation.*
