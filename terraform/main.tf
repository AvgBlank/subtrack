terraform {
  required_version = ">= 1.0.0"

  backend "s3" {
    bucket         = "subtrack-terraform-state"
    key            = "subtrack/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "subtrack-terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}


provider "aws" {
  region = var.aws_region
}

# --- Phase 2: S3 Configuration ---

resource "aws_s3_bucket" "app_bucket" {
  bucket        = "subtrack-app-storage"
  force_destroy = true
}

# Versioning enabled
resource "aws_s3_bucket_versioning" "app_bucket_versioning" {
  bucket = aws_s3_bucket.app_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Encryption enabled
resource "aws_s3_bucket_server_side_encryption_configuration" "app_bucket_encryption" {
  bucket = aws_s3_bucket.app_bucket.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Public access blocked
resource "aws_s3_bucket_public_access_block" "app_bucket_pab" {
  bucket = aws_s3_bucket.app_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- Phase 3: Infrastructure (ECS Fargate) ---

# Default VPC and Subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ECS Security Group
resource "aws_security_group" "ecs_sg" {
  name        = "subtrack-ecs-sg"
  description = "Allow inbound traffic for ECS app"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "app_cluster" {
  name = "subtrack-cluster"
}

# Task Execution Role
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# ECS Task Definition (Combined Server + Client)
resource "aws_ecs_task_definition" "app_task" {
  family                   = "subtrack-app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "nginx"
      image     = "ghcr.io/avgblank/subtrack-nginx:latest"
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
    },
    {
      name      = "client"
      image     = "ghcr.io/avgblank/subtrack-web:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
    },
    {
      name      = "server"
      image     = "ghcr.io/avgblank/subtrack-api:latest"
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
        }
      ]
      environment = [
        {
          name  = "PORT"
          value = "8080"
        },
        {
          name  = "DATABASE_URL"
          value = var.postgres
        },
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "GOOGLE_CLIENT_ID"
          value = var.google_client_id
        },
        {
          name  = "GOOGLE_CLIENT_SECRET"
          value = var.google_client_secret
        },
        {
          name  = "GOOGLE_REDIRECT_URI",
          value = var.google_redirect_uri
        },
        {
          name  = "REFRESH_TOKEN_SECRET",
          value = var.refresh_token_secret
        },
        {
          name  = "ACCESS_TOKEN_SECRET",
          value = var.access_token_secret
        },
      ]
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "app_service" {
  name            = "subtrack-app-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}
