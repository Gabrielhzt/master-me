variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
}

variable "container_image" {
  description = "Container image URL"
  type        = string
}

variable "env_vars" {
  description = "Application environment variables"
  type        = map(string)
}

variable "custom_domain" {
  description = "Custom domain to map to Cloud Run (e.g. api.master-me.dev)"
  type        = string
  default     = "api.master-me.dev"
}
