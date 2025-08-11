@echo off
echo ========================================
echo   Employee Leave Management System
echo ========================================
echo.
echo Starting both Frontend and Backend servers...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: Backend directory not found!
    echo Please make sure you have the backend folder in the same directory.
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "login-frontend" (
    echo ERROR: Frontend directory not found!
    echo Please make sure you have the login-frontend folder in the same directory.
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo [2/4] Installing frontend dependencies...
cd ..\login-frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [3/4] Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm start"

echo [4/4] Starting frontend server...
cd ..\login-frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ========================================
echo   Servers are starting up...
echo ========================================
echo.
echo Backend:  http://localhost:8081
echo Frontend: http://localhost:3000
echo.
echo Default users:
echo   Employee: employee/employee123
echo   Manager:  manager/manager123
echo   HR:       hr/hr123
echo   Admin:    admin/admin123
echo.
echo Press any key to close this window...
pause >nul