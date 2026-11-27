output "vercel_project_id" {
  description = "Vercel project ID."
  value       = vercel_project.finance_news.id
}

output "vercel_project_name" {
  description = "Vercel project name."
  value       = vercel_project.finance_news.name
}

output "production_domain" {
  description = "Configured custom domain, if one was supplied."
  value       = var.production_domain
}
