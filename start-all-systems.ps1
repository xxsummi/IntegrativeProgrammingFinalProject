Write-Host "Starting Complete Don Macchiato System..." -ForegroundColor Green

Write-Host "`n[1/5] Starting Sales Backend (MySQL)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\SalesSystem\backend'; npm start"

Write-Host "`n[2/5] Starting Sales Frontend (React)..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\SalesSystem\frontend'; npm run dev"

Write-Host "`n[3/5] Skipping Inventory Backend (start manually)..." -ForegroundColor Yellow
Write-Host "Manually run: cd InventorySystem/backend/InventorySystem/InventorySystem && dotnet run" -ForegroundColor Gray

Write-Host "`n[4/5] Starting Inventory Frontend (Vue.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\InventorySystem\frontend\InventorySystem\inventory-system'; npm run serve"

Write-Host "`n[5/5] Starting WebSocket Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\InventorySystem\backend\InventorySystem\InventorySystem'; node inventory-ws-server.js"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All systems started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sales System:" -ForegroundColor White
Write-Host "- Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "- Embedded POS: http://localhost:5173/embedded-sales" -ForegroundColor White
Write-Host "`nInventory System:" -ForegroundColor White
Write-Host "- Backend API: http://localhost:5099" -ForegroundColor White
Write-Host "- Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "`nWebSocket Server: ws://localhost:8081" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

Read-Host "`nPress Enter to continue"