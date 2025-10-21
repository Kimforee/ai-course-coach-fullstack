#!/bin/bash

echo "🚀 Starting Codingal AI Course Coach - Simple Local Setup"

echo ""
echo "📦 Installing Python dependencies..."
cd backend
python3 -m pip install -r requirements.txt

echo ""
echo "🗄️ Setting up database..."
python3 manage.py migrate
python3 manage.py seed_demo

echo ""
echo "🌐 Starting Django backend..."
python3 manage.py runserver 8000 &
BACKEND_PID=$!

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "🎨 Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend: http://localhost:8000/api"
echo "🌐 Admin: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
