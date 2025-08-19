@echo off
setlocal enabledelayedexpansion

REM Slack Connect Startup Script for Windows
REM This script will set up and start the entire Slack Connect application

echo ==========================================
echo     Slack Connect Startup Script
echo ==========================================
echo.

echo 🚀 Starting Slack Connect Setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo [INFO] Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo [ERROR] Node.js version 18+ is required. Current version: %NODE_VERSION%
    pause
    exit /b 1
)

echo [SUCCESS] Node.js version detected: %NODE_VERSION%

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] npm version detected:
npm --version

REM Check if mkcert is installed
mkcert --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] mkcert is not installed.
    echo [INFO] Please install mkcert manually for HTTPS certificates.
    echo [INFO] Visit: https://github.com/FiloSottile/mkcert#windows
    echo.
    echo [INFO] You can continue without mkcert, but HTTPS won't work.
    echo [INFO] Slack OAuth requires HTTPS, so you'll need to set this up.
    echo.
    set /p CONTINUE="Continue without mkcert? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Setup cancelled.
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] mkcert already installed
)

REM Generate HTTPS certificates if mkcert is available
if exist "mkcert.exe" (
    if not exist "backend\localhost-key.pem" (
        echo [INFO] Generating HTTPS certificates...
        
        REM Create backend directory if it doesn't exist
        if not exist "backend" mkdir backend
        
        REM Install the local CA
        mkcert -install
        
        REM Generate certificates in backend directory
        cd backend
        mkcert localhost
        cd ..
        
        echo [SUCCESS] HTTPS certificates generated in backend/
    ) else (
        echo [SUCCESS] HTTPS certificates already exist
    )
)

REM Install backend dependencies
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo [SUCCESS] Backend dependencies installed
) else (
    echo [SUCCESS] Backend dependencies already installed
)

REM Install frontend dependencies
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo [SUCCESS] Frontend dependencies installed
) else (
    echo [SUCCESS] Frontend dependencies already installed
)

REM Check environment files
echo [INFO] Checking environment configuration...

if not exist "backend\.env" (
    echo [WARNING] backend\.env file not found!
    echo [INFO] Creating backend\.env template...
    
    (
        echo PORT=4000
        echo.
        echo # From Slack app settings
        echo SLACK_CLIENT_ID=your_client_id_here
        echo SLACK_CLIENT_SECRET=your_client_secret_here
        echo SLACK_REDIRECT_URI=https://localhost:4000/auth/slack/callback
        echo.
        echo # Frontend dev origin ^(Vite default^)
        echo FRONTEND_ORIGIN=http://localhost:5173
    ) > backend\.env
    
    echo [WARNING] Please edit backend\.env with your Slack app credentials!
    echo [INFO] Visit: https://api.slack.com/apps to create a Slack app
) else (
    echo [SUCCESS] backend\.env file found
)

if not exist "frontend\.env" (
    echo [INFO] Creating frontend\.env...
    
    echo VITE_API_BASE=https://localhost:4000 > frontend\.env
    
    echo [SUCCESS] frontend\.env created
) else (
    echo [SUCCESS] frontend\.env file found
)

echo.
echo [INFO] All dependencies installed and configured!
echo.

REM Ask user if they want to start services
set /p START_SERVICES="Do you want to start the services now? (y/n): "

if /i "!START_SERVICES!"=="y" (
    echo.
    echo [INFO] Starting Slack Connect services...
    echo.
    echo [INFO] Starting backend server...
    
    REM Start backend in a new window
    start "Slack Connect Backend" cmd /k "cd backend && npm run dev"
    
    REM Wait a moment for backend to start
    timeout /t 5 /nobreak >nul
    
    echo [INFO] Starting frontend server...
    
    REM Start frontend in a new window
    start "Slack Connect Frontend" cmd /k "cd frontend && npm run dev"
    
    REM Wait a moment for frontend to start
    timeout /t 5 /nobreak >nul
    
    echo.
    echo [SUCCESS] 🎉 Slack Connect is now running!
    echo.
    echo 📱 Frontend: http://localhost:5173
    echo 🔧 Backend:  https://localhost:4000
    echo 🏥 Health:   https://localhost:4000/health
    echo.
    echo [INFO] Services are running in separate windows.
    echo [INFO] Close those windows to stop the services.
    echo.
    pause
) else (
    echo.
    echo [INFO] Setup complete! Run the following commands to start manually:
    echo.
    echo Terminal 1: cd backend ^&^& npm run dev
    echo Terminal 2: cd frontend ^&^& npm run dev
    echo.
    echo [SUCCESS] Happy coding! 🚀
    pause
) 