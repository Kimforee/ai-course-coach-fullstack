# AWS Deployment Guide for Codingal AI Course Coach

This guide will help you deploy the full-stack application to AWS using ECS Fargate, RDS PostgreSQL, and Application Load Balancer.

## Prerequisites

1. AWS CLI installed and configured
2. Docker installed
3. Terraform installed (optional, for infrastructure as code)
4. Your Neon database connection string

## Quick Start

### Option 1: Using Docker Compose (Local Testing)

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Neon database URL
   ```

2. **Run locally with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin: http://localhost:8000/admin

### Option 2: AWS ECS Deployment

#### Step 1: Set up AWS Infrastructure

1. **Create ECR repositories:**
   ```bash
   aws ecr create-repository --repository-name codingal-backend --region us-east-1
   aws ecr create-repository --repository-name codingal-frontend --region us-east-1
   ```

2. **Create RDS PostgreSQL instance:**
   - Go to AWS RDS Console
   - Create PostgreSQL instance
   - Note the endpoint and credentials

3. **Set up secrets in AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret --name codingal/secret-key --secret-string "your-secret-key"
   aws secretsmanager create-secret --name codingal/db-password --secret-string "your-db-password"
   ```

#### Step 2: Deploy Application

1. **Set environment variables:**
   ```bash
   export AWS_ACCOUNT_ID=your-account-id
   export AWS_REGION=us-east-1
   export ECR_REPOSITORY_NAME=codingal-ai-coach
   export ECS_CLUSTER_NAME=codingal-cluster
   export ECS_SERVICE_NAME=codingal-service
   ```

2. **Run deployment script:**
   ```bash
   chmod +x aws-deployment/deploy.sh
   ./aws-deployment/deploy.sh
   ```

#### Step 3: Configure Load Balancer

1. Create target groups for frontend and backend
2. Configure ALB listeners
3. Set up health checks
4. Configure SSL certificate (optional)

## Environment Variables

### Required for Production:
- `SECRET_KEY`: Django secret key
- `DB_HOST`: RDS endpoint
- `DB_PASSWORD`: Database password
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Frontend URLs

### Optional:
- `DEBUG`: Set to False for production
- `DB_NAME`: Database name (default: codingal_db)
- `DB_USER`: Database user (default: postgres)
- `DB_PORT`: Database port (default: 5432)

## Monitoring and Logs

- **CloudWatch Logs**: Application logs are sent to `/ecs/codingal-ai-coach`
- **ECS Service**: Monitor service health and scaling
- **RDS**: Monitor database performance and connections

## Security Considerations

1. **Secrets Management**: Use AWS Secrets Manager for sensitive data
2. **Network Security**: Configure security groups properly
3. **SSL/TLS**: Enable HTTPS for production
4. **CORS**: Configure CORS origins correctly
5. **Database**: Use private subnets for RDS

## Troubleshooting

### Common Issues:

1. **Container fails to start:**
   - Check CloudWatch logs
   - Verify environment variables
   - Check database connectivity

2. **Database connection errors:**
   - Verify RDS security groups
   - Check database credentials
   - Ensure database is accessible from ECS

3. **CORS errors:**
   - Update CORS_ALLOWED_ORIGINS
   - Check frontend API URL configuration

## Cost Optimization

1. **Use t3.micro instances** for development
2. **Enable auto-scaling** based on CPU/memory
3. **Use spot instances** for non-critical workloads
4. **Monitor costs** with AWS Cost Explorer

## Next Steps

1. Set up CI/CD pipeline with GitHub Actions
2. Configure custom domain with Route 53
3. Set up SSL certificate with ACM
4. Implement monitoring and alerting
5. Set up backup and disaster recovery
