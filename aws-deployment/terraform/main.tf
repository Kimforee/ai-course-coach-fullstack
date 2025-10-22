# Terraform configuration for AWS infrastructure
terraform {
  required_version = ">= 1.0"
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

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "codingal-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "codingal-igw"
  }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "codingal-public-subnet-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "codingal-private-subnet-${count.index + 1}"
  }
}

# ECR Repositories
resource "aws_ecr_repository" "backend" {
  name                 = "codingal-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  
  lifecycle {
    ignore_changes = [name]
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "codingal-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  
  lifecycle {
    ignore_changes = [name]
  }
}

# RDS PostgreSQL Database
resource "aws_db_subnet_group" "main" {
  name       = "codingal-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "codingal-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "codingal-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier = "codingal-db"
  engine     = "postgres"
  engine_version = "15.7"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  max_allocated_storage = 100

  db_name  = "codingal_db"
  username = "postgres"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = {
    Name = "codingal-database"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "codingal-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "codingal-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false
}

resource "aws_security_group" "alb" {
  name_prefix = "codingal-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
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

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "ecr_backend_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}
