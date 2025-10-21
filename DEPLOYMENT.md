# 🚀 Deployment Guide - Codingal AI Course Coach

This guide covers deploying your full-stack application to AWS with PostgreSQL (Neon) database.

## 📋 Prerequisites

- Docker and Docker Compose installed
- AWS CLI configured
- Neon database connection string
- Domain name (optional)

## 🏗️ Architecture Overview

```
Internet → ALB → ECS Fargate → RDS PostgreSQL
                ↓
            [Frontend Container]
            [Backend Container]
```

## 🚀 Quick Start (Local Testing)

### 1. Set up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Neon database URL
# Replace NEON_DATABASE_URL with your actual connection string
```

### 2. Run Locally with Docker

```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

## ☁️ AWS Deployment

### Option 1: ECS Fargate (Recommended)

#### Step 1: Create AWS Resources

1. **ECR Repositories:**
   ```bash
   aws ecr create-repository --repository-name codingal-backend --region us-east-1
   aws ecr create-repository --repository-name codingal-frontend --region us-east-1
   ```

2. **RDS PostgreSQL:**
   - Go to AWS RDS Console
   - Create PostgreSQL 15 instance
   - Use private subnets
   - Note the endpoint

3. **Secrets Manager:**
   ```bash
   aws secretsmanager create-secret --name codingal/secret-key --secret-string "your-secret-key"
   aws secretsmanager create-secret --name codingal/db-password --secret-string "your-db-password"
   ```

#### Step 2: Deploy Application

```bash
# Set environment variables
export AWS_ACCOUNT_ID=your-account-id
export AWS_REGION=us-east-1
export ECR_REPOSITORY_NAME=codingal-ai-coach
export ECS_CLUSTER_NAME=codingal-cluster
export ECS_SERVICE_NAME=codingal-service

# Run deployment
chmod +x aws-deployment/deploy.sh
./aws-deployment/deploy.sh
```

### Option 2: EC2 with Docker Compose

1. **Launch EC2 instance** (t3.medium or larger)
2. **Install Docker and Docker Compose**
3. **Clone repository and configure**
4. **Run with docker-compose**

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `DB_HOST` | Database host | `your-neon-host.com` |
| `DB_PASSWORD` | Database password | `your-password` |
| `ALLOWED_HOSTS` | Allowed hosts | `yourdomain.com,www.yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `https://yourdomain.com` |

### Neon Database Setup

1. **Get connection string** from Neon dashboard
2. **Parse connection string:**
   ```
   postgresql://username:password@hostname:port/database
   ```
3. **Update environment variables** with parsed values

## 📊 Monitoring

- **CloudWatch Logs**: `/ecs/codingal-ai-coach`
- **ECS Service**: Monitor health and scaling
- **RDS**: Monitor database performance

## 🔒 Security

1. **Use HTTPS** in production
2. **Configure CORS** properly
3. **Use secrets manager** for sensitive data
4. **Enable VPC** for database isolation
5. **Regular security updates**

## 💰 Cost Optimization

- **Use t3.micro** for development
- **Enable auto-scaling**
- **Use spot instances** for non-critical workloads
- **Monitor with Cost Explorer**

## 🐛 Troubleshooting

### Common Issues:

1. **Container fails to start:**
   - Check CloudWatch logs
   - Verify environment variables
   - Check database connectivity

2. **Database connection errors:**
   - Verify security groups
   - Check credentials
   - Ensure database accessibility

3. **CORS errors:**
   - Update CORS_ALLOWED_ORIGINS
   - Check frontend API URL

## 📝 Next Steps

1. Set up CI/CD pipeline
2. Configure custom domain
3. Set up SSL certificate
4. Implement monitoring
5. Set up backups

## 🆘 Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables
3. Test database connectivity
4. Check AWS service status
