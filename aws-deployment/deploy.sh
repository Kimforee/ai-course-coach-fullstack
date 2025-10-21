#!/bin/bash

# AWS Deployment Script for Codingal AI Course Coach
# Make sure to set these environment variables:
# - AWS_ACCOUNT_ID
# - AWS_REGION
# - ECR_REPOSITORY_NAME
# - ECS_CLUSTER_NAME
# - ECS_SERVICE_NAME

set -e

echo "🚀 Starting AWS deployment..."

# Check required environment variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ] || [ -z "$ECR_REPOSITORY_NAME" ]; then
    echo "❌ Error: Please set AWS_ACCOUNT_ID, AWS_REGION, and ECR_REPOSITORY_NAME environment variables"
    exit 1
fi

# Login to ECR
echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend image
echo "🏗️ Building and pushing backend image..."
cd ../backend
docker build -t $ECR_REPOSITORY_NAME-backend .
docker tag $ECR_REPOSITORY_NAME-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-backend:latest

# Build and push frontend image
echo "🏗️ Building and pushing frontend image..."
cd ../frontend
docker build -t $ECR_REPOSITORY_NAME-frontend .
docker tag $ECR_REPOSITORY_NAME-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-frontend:latest

# Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service --cluster $ECS_CLUSTER_NAME --service $ECS_SERVICE_NAME --force-new-deployment

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at your configured domain"
