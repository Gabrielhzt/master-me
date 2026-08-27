output "service_url" {
  description = "The public URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.master_me.uri
}

output "artifact_registry_repo" {
  description = "Artifact Registry Docker repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

output "service_account_email" {
  description = "The dedicated runtime service account email"
  value       = google_service_account.cloud_run_sa.email
}

output "domain_mapping_dns_records" {
  description = "The DNS resource records to add to Name.com for api.master-me.dev"
  value       = google_cloud_run_domain_mapping.api_domain.status[0].resource_records
}
