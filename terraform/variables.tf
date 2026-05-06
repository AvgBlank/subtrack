variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "postgres" {
  description = "Postgres Connection String"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "google_redirect_uri" {
  description = "Google OAuth Redirect URI"
  type        = string
}

variable "refresh_token_secret" {
  description = "JWT Refresh Token Secret"
  type        = string
  sensitive   = true
}

variable "access_token_secret" {
  description = "JWT Access Token Secret"
  type        = string
  sensitive   = true
}

