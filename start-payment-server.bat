@echo off
echo Starting Cashfree Payment Server...

:: Check if any process is using port 5004
echo Checking if port 5004 is available...
netstat -ano | findstr :5004 > nul
if %errorlevel% equ 0 (
    echo Port 5004 is already in use
    echo Showing processes using port 5004:
    netstat -ano | findstr :5004
    echo.
    echo Please terminate these processes before running the server.
    echo You can use: taskkill /F /PID [PID] to kill a process
    pause
    exit
)

echo Port 5004 is available
echo Starting server on port 5004...
cd server && node index.js 