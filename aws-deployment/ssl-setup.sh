#!/bin/bash

# SSL Certificate Setup for AWS Deployment
echo "🔐 Setting up SSL Certificate for Production..."

# Check if domain is provided
if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Please set DOMAIN_NAME environment variable"
    echo "Example: export DOMAIN_NAME=yourdomain.com"
    exit 1
fi

echo "📋 Setting up SSL for domain: $DOMAIN_NAME"

# Request SSL certificate from AWS Certificate Manager
echo "🔑 Requesting SSL certificate from AWS Certificate Manager..."
CERTIFICATE_ARN=$(aws acm request-certificate \
    --domain-name $DOMAIN_NAME \
    --subject-alternative-names www.$DOMAIN_NAME \
    --validation-method DNS \
    --region us-east-1 \
    --query 'CertificateArn' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate requested successfully!"
    echo "📋 Certificate ARN: $CERTIFICATE_ARN"
    echo ""
    echo "📝 Next steps:"
    echo "1. Check your DNS provider for CNAME records to add"
    echo "2. Run: aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN"
    echo "3. Add the CNAME records to your DNS"
    echo "4. Wait for validation (usually 5-10 minutes)"
    echo "5. Update your ALB listener to use this certificate"
else
    echo "❌ Failed to request SSL certificate"
    exit 1
fi

# Create Route 53 hosted zone if needed
echo "🌐 Setting up Route 53 hosted zone..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query 'HostedZones[0].Id' --output text 2>/dev/null)

if [ "$HOSTED_ZONE_ID" = "None" ] || [ -z "$HOSTED_ZONE_ID" ]; then
    echo "📦 Creating Route 53 hosted zone..."
    HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
        --name $DOMAIN_NAME \
        --caller-reference $(date +%s) \
        --query 'HostedZone.Id' \
        --output text)
    echo "✅ Hosted zone created: $HOSTED_ZONE_ID"
else
    echo "✅ Hosted zone already exists: $HOSTED_ZONE_ID"
fi

echo ""
echo "🎯 SSL Setup Complete!"
echo "📋 Certificate ARN: $CERTIFICATE_ARN"
echo "🌐 Hosted Zone ID: $HOSTED_ZONE_ID"
echo ""
echo "🔧 Update your ALB listener configuration with the certificate ARN"
