@echo off
echo Starting Sales System servers...

echo.
echo Starting MySQL backend server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"

echo.
echo Starting React frontend...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Starting WebSocket server for inventory updates...
start "WebSocket Server" cmd /k "cd /d %~dp0..\InventorySystem\backend\InventorySystem\InventorySystem && node inventory-ws-server.js"

echo.
echo All Sales System servers started!
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:5173
echo - WebSocket: ws://localhost:8081
echo - Embedded Sales: http://localhost:5173/embedded-sales
echo.
pause