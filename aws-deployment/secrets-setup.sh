#!/bin/bash

# AWS Secrets Manager Setup for Production Deployment
echo "🔐 Setting up AWS Secrets Manager for secure deployment..."

# Check if required environment variables are set
if [ -z "$AWS_REGION" ]; then
    echo "❌ Please set AWS_REGION environment variable"
    echo "Example: export AWS_REGION=us-east-1"
    exit 1
fi

echo "📋 Setting up secrets in AWS Secrets Manager..."

# Create secrets for Django
echo "🔑 Creating Django secret key..."
DJANGO_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
aws secretsmanager create-secret \
    --name "codingal/django-secret-key" \
    --description "Django secret key for production" \
    --secret-string "$DJANGO_SECRET_KEY" \
    --region $AWS_REGION

# Create secret for database password
echo "🗄️ Creating database password secret..."
if [ -z "$NEON_DB_PASSWORD" ]; then
    echo "❌ Please set NEON_DB_PASSWORD environment variable"
    echo "Example: export NEON_DB_PASSWORD=your-neon-password"
    exit 1
fi

aws secretsmanager create-secret \
    --name "codingal/db-password" \
    --description "Neon database password" \
    --secret-string "$NEON_DB_PASSWORD" \
    --region $AWS_REGION

# Create secret for database connection string
echo "🔗 Creating database connection string secret..."
if [ -z "$NEON_DATABASE_URL" ]; then
    echo "❌ Please set NEON_DATABASE_URL environment variable"
    echo "Example: export NEON_DATABASE_URL=postgresql://user:pass@host:port/db"
    exit 1
fi

aws secretsmanager create-secret \
    --name "codingal/database-url" \
    --description "Complete Neon database connection string" \
    --secret-string "$NEON_DATABASE_URL" \
    --region $AWS_REGION

# Create secret for allowed hosts
echo "🌐 Creating allowed hosts secret..."
if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Please set DOMAIN_NAME environment variable"
    echo "Example: export DOMAIN_NAME=yourdomain.com"
    exit 1
fi

ALLOWED_HOSTS="$DOMAIN_NAME,www.$DOMAIN_NAME,localhost,127.0.0.1"
aws secretsmanager create-secret \
    --name "codingal/allowed-hosts" \
    --description "Django allowed hosts for production" \
    --secret-string "$ALLOWED_HOSTS" \
    --region $AWS_REGION

# Create secret for CORS origins
echo "🔒 Creating CORS origins secret..."
CORS_ORIGINS="https://$DOMAIN_NAME,https://www.$DOMAIN_NAME"
aws secretsmanager create-secret \
    --name "codingal/cors-origins" \
    --description "CORS allowed origins for production" \
    --secret-string "$CORS_ORIGINS" \
    --region $AWS_REGION

echo "✅ All secrets created successfully!"
echo ""
echo "📋 Created secrets:"
echo "   - codingal/django-secret-key"
echo "   - codingal/db-password"
echo "   - codingal/database-url"
echo "   - codingal/allowed-hosts"
echo "   - codingal/cors-origins"
echo ""
echo "🔧 These secrets will be automatically injected into your ECS containers"
