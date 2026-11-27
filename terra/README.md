# Vercel infrastructure (`terra`)

This directory manages Vercel infrastructure with Terraform. It does not manage the PostgreSQL schema; Drizzle Kit owns database migrations.

## Responsibilities

- Vercel project and Next.js framework configuration
- Optional GitHub repository connection
- Production branch
- Preview and production runtime environment variables
- Optional custom production domain

## Secrets

Do not commit `terraform.tfvars`, `.tfstate`, `.tfstate.*`, or real credentials. Provide the Vercel token and database URL through CI secrets or environment variables.

`DATABASE_URL` is the Supabase transaction-pooler URL used by Vercel runtime functions. `DIRECT_URL` is intentionally not provisioned into Vercel by this module: it is a privileged migration connection and should be supplied only to the Drizzle migration job.

## First setup

```bash
cd terra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with real non-secret project values.
export VERCEL_API_TOKEN="..."
terraform init
terraform fmt -check
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

The GitHub connection requires the Vercel GitHub integration to be installed. DNS records for a custom domain are managed by the DNS provider unless that provider is also added to Terraform.

## CI order

1. `terraform plan` and review the infrastructure change.
2. `terraform apply` from the protected infrastructure workflow.
3. Run `npm run db:migrate` with `DIRECT_URL` supplied as a CI secret.
4. Deploy through the connected Vercel Git repository.

For a team account, set `vercel_team_id` and keep it consistent for all Vercel resources.

## Git pre-push verification

The repository includes a versioned `.githooks/pre-push` hook. Enable it once from the repository root:

```bash
git config core.hooksPath .githooks
```

Every push will then run `npm run verify`, which checks Prettier formatting, ESLint, TypeScript, and the Next.js production build.
