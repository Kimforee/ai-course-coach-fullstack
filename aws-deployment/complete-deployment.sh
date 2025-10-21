#!/bin/bash

# Complete AWS Deployment with SSL
echo "🚀 Complete AWS Deployment with SSL Certificate"

# Check required environment variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ] || [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Please set required environment variables:"
    echo "   export AWS_ACCOUNT_ID=your-account-id"
    echo "   export AWS_REGION=us-east-1"
    echo "   export DOMAIN_NAME=yourdomain.com"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   Region: $AWS_REGION"
echo "   Domain: $DOMAIN_NAME"

# Step 1: Build and push Docker images
echo "🏗️ Building and pushing Docker images..."
./deploy-aws.sh

# Step 2: Set up SSL certificate
echo "🔐 Setting up SSL certificate..."
export DOMAIN_NAME=$DOMAIN_NAME
./aws-deployment/ssl-setup.sh

# Step 3: Create ECS cluster
echo "📦 Creating ECS cluster..."
aws ecs create-cluster --cluster-name codingal-cluster --region $AWS_REGION

# Step 4: Create VPC and networking
echo "🌐 Setting up VPC and networking..."
aws cloudformation create-stack \
    --stack-name codingal-vpc \
    --template-body file://aws-deployment/cloudformation/vpc-template.yaml \
    --region $AWS_REGION

# Step 5: Create RDS database
echo "🗄️ Creating RDS database..."
aws rds create-db-instance \
    --db-instance-identifier codingal-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password $DB_PASSWORD \
    --allocated-storage 20 \
    --region $AWS_REGION

# Step 6: Create Application Load Balancer
echo "⚖️ Creating Application Load Balancer..."
aws elbv2 create-load-balancer \
    --name codingal-alb \
    --subnets subnet-12345 subnet-67890 \
    --security-groups sg-12345 \
    --region $AWS_REGION

# Step 7: Create ECS service
echo "🚀 Creating ECS service..."
aws ecs create-service \
    --cluster codingal-cluster \
    --service-name codingal-service \
    --task-definition codingal-ai-coach \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:$AWS_REGION:$AWS_ACCOUNT_ID:targetgroup/codingal-tg/1234567890123456,containerName=backend,containerPort=8000" \
    --region $AWS_REGION

echo "✅ Deployment complete!"
echo "🌐 Your application will be available at: https://$DOMAIN_NAME"
echo "📊 Monitor your deployment in the AWS Console"
