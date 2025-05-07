@echo off
echo Starting Cashfree Integration...

echo Starting server...
start cmd /k "cd server && npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Starting client...
start cmd /k "npm run dev"

echo Both server and client are running!
echo Server: http://localhost:5004
echo Client: http://localhost:5173 