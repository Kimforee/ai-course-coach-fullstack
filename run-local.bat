@echo off
echo 🚀 Starting Codingal AI Course Coach - Simple Local Setup

echo.
echo 📦 Installing Python dependencies...
cd backend
python -m pip install -r requirements.txt

echo.
echo 🗄️ Setting up database...
python manage.py migrate
python manage.py seed_demo

echo.
echo 🌐 Starting Django backend...
start "Backend" cmd /k "python manage.py runserver 8000"

echo.
echo 📦 Installing frontend dependencies...
cd ..\frontend
npm install

echo.
echo 🎨 Starting React frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Application started!
echo 🌐 Frontend: http://localhost:3000
echo 🌐 Backend: http://localhost:8000/api
echo 🌐 Admin: http://localhost:8000/admin
echo.
pause
