# Market Brief

A practical starter for a finance news website built with Next.js App Router, TypeScript, PostgreSQL, Drizzle ORM, and a custom admin area.

## Included

- Server-rendered public homepage and `/article/[slug]` article pages.
- `NewsArticle` JSON-LD on public article pages.
- `max-image-preview:large`, canonical URLs, Open Graph/Twitter metadata, and noindex admin metadata.
- `/sitemap.xml`, `/news-sitemap.xml`, and `/robots.txt` generated with Next.js conventions.
- A starter `/admin` editorial queue. It is intentionally not production authentication; add auth and server-side authorization before deploying private content.
- `published: boolean` as the single publication source of truth. Unpublished or future-dated articles are not listed, rendered, or included in sitemaps.
- Drizzle schema for PostgreSQL, including indexed publication and section fields.

## Local setup

Requirements: Node.js 20+, Terraform 1.6+, and a PostgreSQL database (Supabase for deployed environments or local Postgres for development).

```bash
npm install
cp .env.example .env.local
# Edit .env.local with a real local/preview DATABASE_URL.
npm run dev
```

Open <http://localhost:3000>. The public site and admin dashboard intentionally contain no demo content. Connect the repository in `src/lib/articles.ts` to PostgreSQL through Drizzle before adding real articles. `src/db/schema.ts` and `src/db/client.ts` are ready for that integration.

## Code quality and push checks

```bash
npm run format        # format source files with Prettier
npm run format:check  # verify formatting
npm run lint          # run ESLint and Next.js Core Web Vitals rules
npm run verify        # formatting, lint, and production build
```

Enable the versioned pre-push hook once:

```bash
git config core.hooksPath .githooks
```

After that, a push runs the full verification command before Git sends commits to the upstream repository.

## Environment variables

`.env.example` contains placeholders only. Never commit `.env.local`, production credentials, or real connection strings.

- `DATABASE_URL`: Supabase transaction-pooler PostgreSQL connection string for Vercel runtime traffic. Keep it server-only; do not prefix it with `NEXT_PUBLIC_` and do not read it in Client Components.
- `DIRECT_URL`: Supabase direct PostgreSQL connection string for Drizzle migrations and administrative scripts. Keep it server-only.
- `NEXT_PUBLIC_SITE_URL`: canonical site origin, such as `https://news.example.com`. This is public and used for canonical URLs, structured data, sitemaps, and robots metadata.

The database module imports `server-only` and reads `DATABASE_URL` on the server using `postgres` + Drizzle. It is configured for serverless use with one connection per warm Vercel instance, prepared statements disabled for transaction pooling, and SSL required. Use separate database branches or databases for local, preview, and production environments.

## Drizzle migrations

The Drizzle configuration reads `DIRECT_URL` first, then `DATABASE_URL`, and uses `src/db/schema.ts` as its schema source. Use the direct URL for migrations.

```bash
npm run db:generate  # generate a committed SQL migration after schema changes
npm run db:migrate   # apply committed migrations to the DIRECT_URL database
npm run db:studio    # inspect the database locally
```

Run migrations as a controlled release step, not during a request. `drizzle-kit push` is intentionally not part of the standard scripts; use it only for disposable local experimentation. Before production, review generated SQL and make schema changes backward-compatible with the currently deployed app.

## Vercel deployment

### Terraform

Vercel infrastructure is managed from `terra/`. Terraform creates the Vercel project, optional GitHub connection, production branch, runtime environment variables, and optional custom domain. It does not manage the PostgreSQL schema.

```bash
cd terra
cp terraform.tfvars.example terraform.tfvars
# Set TF_VAR_vercel_api_token through a shell or CI secret.
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

Run Drizzle migrations separately with `DIRECT_URL` supplied only to the migration job:

```bash
DIRECT_URL="postgresql://..." npm run db:migrate
```

The Supabase transaction-pooler `DATABASE_URL` is provisioned to Vercel for runtime traffic. The privileged `DIRECT_URL` is intentionally not added to the running Vercel application.

Do not paste secrets into source files, `vercel.json`, Terraform variable files, or committed shell scripts. Keep Terraform state in a protected remote backend when the project is shared. If the project later uses a migration build hook, make it an explicit, reviewed release command and ensure it targets the correct environment.

## Next steps before production

- Replace the in-memory repository with Drizzle queries in a server-only data-access module.
- Add authentication, role-based authorization, CSRF-safe mutations, and audit logs to `/admin`.
- Add ingestion jobs, source licensing checks, corrections history, and editorial review states.
- Add image storage/processing and verify hero-image rights and stable absolute URLs.
- Measure LCP, INP, and CLS for homepage, category, and article templates in field data and CI.

