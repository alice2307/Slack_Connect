@echo off
setlocal enabledelayedexpansion
echo ==========================================
echo     Slack Connect Startup Script
echo ==========================================
echo.

echo Starting Slack Connect Setup...

REM Check if backend .env exists and prompt for credentials if needed
if not exist "backend\.env" (
    echo.
    echo ==========================================
    echo Slack App Credentials Required
    echo ==========================================
    echo.
    echo Before we can start, you need to provide your Slack app credentials.
    echo If you haven't created a Slack app yet, please follow the README.md
    echo instructions first.
    echo.
    
    set /p SLACK_CLIENT_ID="Enter your Slack Client ID: "
    set /p SLACK_CLIENT_SECRET="Enter your Slack Client Secret: "
    
    echo.
    echo Creating backend .env file with your credentials...
    (
        echo PORT=4000
        echo.
        echo # From Slack app settings
        echo SLACK_CLIENT_ID=!SLACK_CLIENT_ID!
        echo SLACK_CLIENT_SECRET=!SLACK_CLIENT_SECRET!
        echo SLACK_REDIRECT_URI=https://localhost:4000/auth/slack/callback
        echo.
        echo # Frontend dev origin
        echo FRONTEND_ORIGIN=http://localhost:5173
    ) > backend\.env
    echo Backend .env created with your Slack credentials.
    
    REM Verify the file was created correctly
    echo.
    echo Verifying .env file contents:
    type backend\.env
) else (
    echo Backend .env file found.
)

REM Create frontend .env if it doesn't exist
if not exist "frontend\.env" (
    echo Creating frontend .env file...
    echo VITE_API_BASE=https://localhost:4000 > frontend\.env
    echo Frontend .env created.
) else (
    echo Frontend .env file found.
)

echo.
echo Setup complete! Starting services...

REM Install backend dependencies
echo Installing backend dependencies...
if not exist "backend\node_modules" (
    cd backend
    call npm install
    cd ..
    echo Backend dependencies installed.
) else (
    echo Backend dependencies already installed.
)

REM Install frontend dependencies
echo Installing frontend dependencies...
if not exist "frontend\node_modules" (
    cd frontend
    call npm install
    cd ..
    echo Frontend dependencies installed.
) else (
    echo Frontend dependencies already installed.
)

REM Start backend
echo Starting backend server...
start "Slack Connect Backend" cmd /k "cd backend && npm run dev"

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
start "Slack Connect Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo Slack Connect is now running!
echo.
echo Frontend: http://localhost:5173
echo Backend:  https://localhost:4000
echo Health:   https://localhost:4000/health
echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
echo ==========================================
echo.
pause 