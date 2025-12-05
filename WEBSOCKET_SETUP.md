# WebSocket Real-time Implementation Setup

## Overview
This implementation adds real-time communication between the Sales and Inventory systems using WebSockets and SignalR.

## Architecture
```
Sales Frontend (React) ←→ Sales Backend (Node.js) ←→ WebSocket Server ←→ Inventory Backend (C#) ←→ Inventory Frontend (Vue.js)
                                                                                    ↕
                                                                               SignalR Hub
```

## Setup Instructions

### 1. Install Dependencies

**Sales Backend (Node.js):**
```bash
cd backend
npm install
```

**Sales Frontend (React):**
```bash
cd donmacchiato
npm install
```

**Inventory Frontend (Vue.js):**
```bash
cd InventorySystem/frontend/InventorySystem/inventory-system
npm install
```

### 2. Start Services in Order

1. **PostgreSQL Database** (for Inventory)
2. **MySQL Database** (for Sales)
3. **Inventory Backend:**
   ```bash
   cd InventorySystem/backend/InventorySystem/InventorySystem
   dotnet run
   ```
4. **WebSocket Server:**
   ```bash
   cd InventorySystem/backend/InventorySystem/InventorySystem
   node inventory-ws-server.js
   ```
5. **Sales Backend:**
   ```bash
   cd backend
   npm start
   ```
6. **Inventory Frontend:**
   ```bash
   cd InventorySystem/frontend/InventorySystem/inventory-system
   npm run serve
   ```
7. **Sales Frontend:**
   ```bash
   cd donmacchiato
   npm run dev
   ```

## Real-time Features Implemented

### 1. **Stock Updates**
- When a sale is made, inventory is automatically decremented
- All connected inventory frontends see stock changes in real-time

### 2. **Product Management**
- Adding/editing/deleting products in inventory updates all connected clients
- Sales system receives updated product information

### 3. **Connection Management**
- Automatic reconnection on connection loss
- Authentication tokens for secure connections
- Error handling and logging

## API Endpoints

### WebSocket Server
- **URL:** `ws://localhost:8080`
- **Auth:** Token-based (`?token=sales-system-token`)

### SignalR Hub
- **URL:** `http://localhost:5099/inventoryHub`
- **Methods:** `JoinInventoryGroup`, `StockUpdated`, `ProductAdded`, `ProductDeleted`

### Notification API
- **POST** `/api/notify/stock-update` - Notify SignalR clients of stock changes

## Testing Real-time Features

1. Open Inventory frontend (Vue.js) in multiple browser tabs
2. Open Sales frontend (React) 
3. Make a sale - observe stock decrements in inventory tabs
4. Add/edit products in inventory - observe updates across all tabs
5. Check browser console for WebSocket connection logs

## Troubleshooting

- Ensure all services are running on correct ports
- Check browser console for WebSocket connection errors
- Verify database connections are working
- Check that CORS is properly configured for cross-origin requests
- **IMPORTANT**: Run `npm install` in each directory before starting services