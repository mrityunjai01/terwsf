terraform {
  required_version = ">= 1.6.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.27"
    }
  }
}

provider "vercel" {
  team = var.vercel_team_id
}
