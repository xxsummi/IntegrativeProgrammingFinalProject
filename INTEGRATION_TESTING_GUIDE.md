# Integration Testing Guide: WebSocket Real-time Updates

## Testing Strategy Overview

Test the integration between Sales and Inventory systems through:
1. **Unit Tests** - Individual WebSocket components
2. **Integration Tests** - End-to-end data flow
3. **Manual Tests** - Real-time UI updates
4. **Load Tests** - Multiple concurrent connections

## 1. Manual Testing Scenarios

### Test 1: Basic WebSocket Connection
```bash
# Terminal 1: Start Inventory WebSocket Server
cd InventorySystem/backend/InventorySystem/InventorySystem
node inventory-ws-server.js

# Terminal 2: Start Sales Backend
cd SalesSystem/backend
npm start

# Terminal 3: Start Sales Frontend
cd SalesSystem/frontend
npm run dev
```

**Expected Results:**
- Console shows "Connected to inventory WebSocket"
- No connection errors in browser dev tools

### Test 2: Stock Decrement on Sale
1. Open Sales frontend (http://localhost:5173)
2. Open Inventory frontend (http://localhost:8081)
3. Make a sale in Sales system
4. **Verify:** Stock decreases in Inventory system immediately

### Test 3: Multiple Client Updates
1. Open Inventory frontend in 3 browser tabs
2. Make a sale from Sales system
3. **Verify:** All inventory tabs show updated stock simultaneously

## 2. Automated Test Scripts

### WebSocket Connection Test