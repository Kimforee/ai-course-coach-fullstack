#!/bin/bash

# Complete Production Deployment with Secrets Management
echo "🚀 Starting Complete Production Deployment..."

# Check required environment variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ] || [ -z "$DOMAIN_NAME" ] || [ -z "$NEON_DB_PASSWORD" ] || [ -z "$NEON_DATABASE_URL" ]; then
    echo "❌ Please set all required environment variables:"
    echo "   export AWS_ACCOUNT_ID=your-account-id"
    echo "   export AWS_REGION=us-east-1"
    echo "   export DOMAIN_NAME=yourdomain.com"
    echo "   export NEON_DB_PASSWORD=your-neon-password"
    echo "   export NEON_DATABASE_URL=postgresql://user:pass@host:port/db"
    exit 1
fi

echo "📋 Production Deployment Configuration:"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   Region: $AWS_REGION"
echo "   Domain: $DOMAIN_NAME"
echo "   Database: Neon PostgreSQL"
echo ""

# Step 1: Set up secrets in AWS Secrets Manager
echo "🔐 Step 1: Setting up secrets in AWS Secrets Manager..."
chmod +x aws-deployment/secrets-setup.sh
./aws-deployment/secrets-setup.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up secrets"
    exit 1
fi

# Step 2: Build and push Docker images
echo "🏗️ Step 2: Building and pushing Docker images..."
chmod +x deploy-aws.sh
./deploy-aws.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to build and push images"
    exit 1
fi

# Step 3: Set up SSL certificate
echo "🔐 Step 3: Setting up SSL certificate..."
chmod +x aws-deployment/ssl-setup.sh
./aws-deployment/ssl-setup.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up SSL certificate"
    exit 1
fi

# Step 4: Create ECS cluster
echo "📦 Step 4: Creating ECS cluster..."
aws ecs create-cluster --cluster-name codingal-cluster --region $AWS_REGION

# Step 5: Create CloudWatch log group
echo "📊 Step 5: Creating CloudWatch log group..."
aws logs create-log-group --log-group-name /ecs/codingal-ai-coach --region $AWS_REGION

# Step 6: Register task definition
echo "📋 Step 6: Registering ECS task definition..."
# Replace placeholders in task definition
sed "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g; s/REGION/$AWS_REGION/g; s/YOUR_DOMAIN/$DOMAIN_NAME/g" \
    aws-deployment/ecs-task-definition-with-secrets.json > /tmp/task-definition.json

aws ecs register-task-definition --cli-input-json file:///tmp/task-definition.json --region $AWS_REGION

# Step 7: Create ECS service
echo "🚀 Step 7: Creating ECS service..."
aws ecs create-service \
    --cluster codingal-cluster \
    --service-name codingal-service \
    --task-definition codingal-ai-coach \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
    --region $AWS_REGION

echo "✅ Production deployment complete!"
echo "🌐 Your application will be available at: https://$DOMAIN_NAME"
echo "📊 Monitor your deployment in the AWS Console"
echo ""
echo "🔧 Next steps:"
echo "1. Set up Application Load Balancer"
echo "2. Configure Route 53 DNS records"
echo "3. Test your application"
echo "4. Set up monitoring and alerting"
