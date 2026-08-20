# ☁️ Terraform Infrastructure

## 🚀 Deploying Changes from Local Machine

### 1. Authenticate with GCP & Docker
```bash
gcloud auth login
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

### 2 Setup environment variables (update the values)
```bash
cp .terraform/terraform.tfvars.example .terraform/terraform.tfvars
```

### 3. Build & Push Docker Image
```bash
# Tag with new version (e.g. v2)
docker build -t europe-west1-docker.pkg.dev/mastermeapp/cloud-run-apps/master-me-api:v2 ..
docker push [URL_FROM_ABOVE]
```

### 4. Deploy with Terraform
Ensure `terraform.tfvars` exists (copy from `terraform.tfvars.example` if first time), then apply:

```bash
cd terraform
terraform apply -var="container_image=europe-west1-docker.pkg.dev/mastermeapp/cloud-run-apps/master-me-api:v2"
```

### 5. Verify Health Endpoint
```bash
curl $(terraform output -raw service_url)/health
```
