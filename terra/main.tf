resource "vercel_project" "finance_news" {
  name      = var.project_name
  framework = "nextjs"

  production_branch = var.production_branch

  dynamic "git_repository" {
    for_each = var.github_repository == null ? [] : [var.github_repository]

    content {
      type = "github"
      repo = git_repository.value
    }
  }
}

resource "vercel_project_environment_variable" "database_url" {
  project_id = vercel_project.finance_news.id
  key        = "DATABASE_URL"
  value      = var.database_url
  target     = ["preview", "production"]
  sensitive  = true
  comment    = "Supabase transaction-pooler URL for Vercel runtime traffic."
}

resource "vercel_project_environment_variable" "site_url" {
  project_id = vercel_project.finance_news.id
  key        = "NEXT_PUBLIC_SITE_URL"
  value      = var.site_url
  target     = ["preview", "production"]
  sensitive  = false
  comment    = "Canonical public site URL used by metadata, sitemap, and robots output."
}

resource "vercel_project_domain" "production" {
  count      = var.production_domain == null ? 0 : 1
  project_id = vercel_project.finance_news.id
  domain     = var.production_domain
}
