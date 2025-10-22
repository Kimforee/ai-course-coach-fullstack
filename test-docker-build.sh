#!/bin/bash

echo "🔨 Testing Docker build..."

# Test backend build
echo "Building backend..."
cd backend
docker build -t codingal-backend-test .

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
else
    echo "❌ Backend build failed!"
    exit 1
fi

# Test frontend build
echo "Building frontend..."
cd ../frontend
docker build -t codingal-frontend-test .

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "🎉 All builds successful!"
