@echo off
echo ========================================
echo WebSocket Integration Test Suite
echo ========================================

echo.
echo 1. Testing WebSocket Connection...
node test-websocket-connection.js

echo.
echo 2. Running Load Test...
node load-test-websocket.js

echo.
echo 3. Running Backend Tests...
cd SalesSystem\backend
call npm test -- websocket-integration.test.js
cd ..\..

echo.
echo 4. Running Frontend Tests...
cd SalesSystem\frontend
call npm test websocket.test.js
cd ..\..

echo.
echo ========================================
echo Integration Tests Complete
echo ========================================
pause