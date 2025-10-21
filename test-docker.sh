#!/bin/bash

echo "🧪 Testing Docker Build for Deployment..."

# Test backend build only
echo "🏗️ Building backend container..."
cd backend
docker build -t codingal-backend-test .

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
    
    # Test running the backend
    echo "🚀 Testing backend container..."
    docker run -d --name backend-test \
        -e DEBUG=False \
        -e DB_NAME=neondb \
        -e DB_USER=neondb_owner \
        -e DB_PASSWORD=\${DB_PASSWORD} \
        -e DB_HOST=\${DB_HOST} \
        -e DB_PORT=5432 \
        -e SECRET_KEY=test-secret-key \
        -e ALLOWED_HOSTS=localhost,127.0.0.1 \
        -e CORS_ALLOWED_ORIGINS=http://localhost:3000 \
        -p 8000:8000 \
        codingal-backend-test
    
    echo "✅ Backend container started!"
    echo "🌐 Backend API: http://localhost:8000/api"
    echo "🌐 Admin: http://localhost:8000/admin"
    echo ""
    echo "To stop: docker stop backend-test && docker rm backend-test"
else
    echo "❌ Backend build failed"
    exit 1
fi
