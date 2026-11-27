variable "vercel_team_id" {
  description = "Optional Vercel team ID. Leave null for a personal account."
  type        = string
  default     = null
}

variable "project_name" {
  description = "Vercel project name."
  type        = string
  default     = "finance-news"
}

variable "github_repository" {
  description = "Optional GitHub repository in owner/name form."
  type        = string
  default     = null
}

variable "production_branch" {
  description = "Git branch used for production deployments."
  type        = string
  default     = "main"
}

variable "site_url" {
  description = "Canonical public site URL, without a trailing slash."
  type        = string
}

variable "database_url" {
  description = "Supabase transaction-pooler URL used by Vercel runtime functions."
  type        = string
  sensitive   = true
}

variable "production_domain" {
  description = "Optional custom production domain, for example news.example.com."
  type        = string
  default     = null
}
