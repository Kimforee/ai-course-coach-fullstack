# 🚀 AWS Deployment Guide - Codingal AI Course Coach

## 📋 Prerequisites

1. **AWS CLI installed and configured**
2. **Docker installed and running**
3. **Your Neon database connection string**
4. **AWS account with appropriate permissions**

## 🏗️ Deployment Architecture

```
Internet → ALB → ECS Fargate → RDS PostgreSQL (Neon)
                ↓
            [Frontend Container]
            [Backend Container]
```

## 🚀 Quick Deployment Steps

### Step 1: Set Environment Variables
```bash
export AWS_ACCOUNT_ID=your-account-id
export AWS_REGION=us-east-1
export ECR_REPOSITORY_NAME=codingal-ai-coach
export ECS_CLUSTER_NAME=codingal-cluster
export ECS_SERVICE_NAME=codingal-service
```

### Step 2: Run Deployment Script
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

## 🔧 Manual Deployment Steps

### 1. Create ECR Repositories
```bash
aws ecr create-repository --repository-name codingal-backend --region us-east-1
aws ecr create-repository --repository-name codingal-frontend --region us-east-1
```

### 2. Build and Push Images
```bash
# Backend
cd backend
docker build -t codingal-backend .
docker tag codingal-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/codingal-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/codingal-backend:latest

# Frontend
cd ../frontend
docker build -t codingal-frontend .
docker tag codingal-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/codingal-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/codingal-frontend:latest
```

### 3. Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name codingal-cluster
```

### 4. Create Task Definition
```bash
aws ecs register-task-definition --cli-input-json file://aws-deployment/ecs-task-definition.json
```

### 5. Create ECS Service
```bash
aws ecs create-service \
  --cluster codingal-cluster \
  --service-name codingal-service \
  --task-definition codingal-ai-coach \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

## 🔐 Environment Variables for Production

Update the ECS task definition with your production values:

```json
{
  "environment": [
    {
      "name": "DB_HOST",
      "value": "your-neon-host.com"
    },
    {
      "name": "DB_PASSWORD",
      "value": "your-neon-password"
    },
    {
      "name": "ALLOWED_HOSTS",
      "value": "yourdomain.com"
    }
  ]
}
```

## 🌐 Domain and SSL Setup

### Step 1: SSL Certificate Setup
```bash
# Set your domain
export DOMAIN_NAME=yourdomain.com

# Request SSL certificate
aws acm request-certificate \
    --domain-name $DOMAIN_NAME \
    --subject-alternative-names www.$DOMAIN_NAME \
    --validation-method DNS \
    --region us-east-1
```

### Step 2: Route 53 Configuration
```bash
# Create hosted zone
aws route53 create-hosted-zone \
    --name $DOMAIN_NAME \
    --caller-reference $(date +%s)
```

### Step 3: ALB SSL Configuration
- **Port 80**: Redirect to HTTPS
- **Port 443**: SSL termination with your certificate
- **Target Groups**: Route to ECS containers

### Step 4: DNS Records
- **A Record**: Point domain to ALB
- **CNAME**: www subdomain to ALB

## 📊 Monitoring and Logs

- **CloudWatch Logs**: `/ecs/codingal-ai-coach`
- **ECS Service**: Monitor health and scaling
- **ALB**: Monitor traffic and response times

## 💰 Cost Optimization

- **Use t3.micro** for development
- **Enable auto-scaling** based on CPU/memory
- **Use spot instances** for non-critical workloads
- **Monitor costs** with AWS Cost Explorer

## 🔒 Security Best Practices

1. **Use IAM roles** instead of access keys
2. **Enable VPC** for network isolation
3. **Use secrets manager** for sensitive data
4. **Enable CloudTrail** for audit logging
5. **Regular security updates**

## 🆘 Troubleshooting

### Common Issues:
1. **Container fails to start**: Check CloudWatch logs
2. **Database connection errors**: Verify security groups
3. **CORS errors**: Update CORS_ALLOWED_ORIGINS
4. **SSL issues**: Check certificate configuration

### Useful Commands:
```bash
# Check ECS service status
aws ecs describe-services --cluster codingal-cluster --services codingal-service

# View logs
aws logs tail /ecs/codingal-ai-coach --follow

# Update service
aws ecs update-service --cluster codingal-cluster --service codingal-service --force-new-deployment
```

## 📝 Next Steps

1. **Set up CI/CD pipeline** with GitHub Actions
2. **Configure monitoring** and alerting
3. **Set up backup** and disaster recovery
4. **Implement auto-scaling** policies
5. **Set up staging environment**

## 🎯 Production Checklist

- [ ] ECR repositories created
- [ ] Images built and pushed
- [ ] ECS cluster created
- [ ] Task definition registered
- [ ] ECS service running
- [ ] ALB configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Security groups configured
- [ ] Database accessible
- [ ] Application tested

Your application will be accessible at your configured domain! 🎉
