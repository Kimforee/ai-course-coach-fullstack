# 🔒 Secure Deployment Setup

## ⚠️ IMPORTANT SECURITY NOTICE

**NEVER commit real credentials to Git!** This guide shows you how to set up your deployment securely.

## 🔐 Step 1: Get Your AWS Credentials

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "terraform-user"
3. Go to "Security credentials" tab
4. Create access key if needed
5. **SAVE THE CREDENTIALS SECURELY**

## 🚀 Step 2: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets (replace with your actual values):

```
AWS_ACCESS_KEY_ID = YOUR_ACTUAL_ACCESS_KEY
AWS_SECRET_ACCESS_KEY = YOUR_ACTUAL_SECRET_KEY
AWS_ACCOUNT_ID = YOUR_ACTUAL_ACCOUNT_ID
DB_PASSWORD = YOUR_DATABASE_PASSWORD
SECRET_KEY = YOUR_DJANGO_SECRET_KEY
DB_NAME = codingal_db
DB_USER = postgres
DB_PORT = 5432
ALLOWED_HOSTS = *.amazonaws.com
CORS_ALLOWED_ORIGINS = https://*.amazonaws.com
DEBUG = False
```

## 🎯 Step 3: Deploy

1. Push your code to GitHub
2. GitHub Actions will automatically deploy
3. Check the Actions tab for progress

## ✅ Security Checklist

- [ ] No real credentials in code
- [ ] All secrets in GitHub Secrets
- [ ] .gitignore properly configured
- [ ] No .env files committed
- [ ] No AWS credentials in documentation

## 🆘 If Credentials Are Exposed

If you accidentally commit credentials:

1. **IMMEDIATELY** rotate your AWS keys
2. Delete the exposed keys from AWS IAM
3. Create new keys
4. Update GitHub Secrets
5. Remove credentials from Git history

## 🔒 Best Practices

- Use environment variables for all secrets
- Never hardcode credentials
- Use GitHub Secrets for CI/CD
- Regularly rotate access keys
- Monitor AWS CloudTrail for suspicious activity
