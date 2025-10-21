#!/bin/bash

# AWS Deployment Script for Codingal AI Course Coach
echo "🚀 Starting AWS Deployment..."

# Check if required environment variables are set
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
    echo "❌ Please set AWS_ACCOUNT_ID and AWS_REGION environment variables"
    echo "Example: export AWS_ACCOUNT_ID=123456789012"
    echo "Example: export AWS_REGION=us-east-1"
    exit 1
fi

# Set default values
ECR_REPOSITORY_NAME=${ECR_REPOSITORY_NAME:-"codingal-ai-coach"}
ECS_CLUSTER_NAME=${ECS_CLUSTER_NAME:-"codingal-cluster"}
ECS_SERVICE_NAME=${ECS_SERVICE_NAME:-"codingal-service"}

echo "📋 Deployment Configuration:"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   Region: $AWS_REGION"
echo "   ECR Repository: $ECR_REPOSITORY_NAME"
echo "   ECS Cluster: $ECS_CLUSTER_NAME"
echo "   ECS Service: $ECS_SERVICE_NAME"

# Login to ECR
echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repositories if they don't exist
echo "📦 Creating ECR repositories..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME-backend --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME-backend --region $AWS_REGION

aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME-frontend --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME-frontend --region $AWS_REGION

# Build and push backend image
echo "🏗️ Building and pushing backend image..."
cd backend
docker build -t $ECR_REPOSITORY_NAME-backend .
docker tag $ECR_REPOSITORY_NAME-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-backend:latest

# Build and push frontend image
echo "🏗️ Building and pushing frontend image..."
cd ../frontend
docker build -t $ECR_REPOSITORY_NAME-frontend .
docker tag $ECR_REPOSITORY_NAME-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME-frontend:latest

cd ..

echo "✅ Images pushed successfully!"
echo "🌐 Your application is ready for deployment on AWS ECS"
echo ""
echo "Next steps:"
echo "1. Create ECS cluster: aws ecs create-cluster --cluster-name $ECS_CLUSTER_NAME"
echo "2. Create task definition with the pushed images"
echo "3. Create ECS service"
echo "4. Set up Application Load Balancer"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
