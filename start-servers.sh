#!/bin/bash

echo "========================================"
echo "  Employee Leave Management System"
echo "========================================"
echo ""
echo "Starting both Frontend and Backend servers..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "ERROR: Backend directory not found!"
    echo "Please make sure you have the backend folder in the same directory."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "login-frontend" ]; then
    echo "ERROR: Frontend directory not found!"
    echo "Please make sure you have the login-frontend folder in the same directory."
    exit 1
fi

echo "[1/4] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

echo "[2/4] Installing frontend dependencies..."
cd ../login-frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi

echo "[3/4] Starting backend server..."
cd ../backend
gnome-terminal --title="Backend Server" -- bash -c "npm start; exec bash" 2>/dev/null || \
xterm -title "Backend Server" -e "npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm start"' 2>/dev/null || \
echo "Please start backend manually: cd backend && npm start"

echo "[4/4] Starting frontend server..."
cd ../login-frontend
gnome-terminal --title="Frontend Server" -- bash -c "npm start; exec bash" 2>/dev/null || \
xterm -title "Frontend Server" -e "npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm start"' 2>/dev/null || \
echo "Please start frontend manually: cd login-frontend && npm start"

echo ""
echo "========================================"
echo "  Servers are starting up..."
echo "========================================"
echo ""
echo "Backend:  http://localhost:8081"
echo "Frontend: http://localhost:3000"
echo ""
echo "Default users:"
echo "  Employee: employee/employee123"
echo "  Manager:  manager/manager123"
echo "  HR:       hr/hr123"
echo "  Admin:    admin/admin123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop
trap 'echo "Stopping servers..."; exit 0' INT
while true; do
    sleep 1
done