# Two-Way WebSocket Implementation

## Overview
This implementation enables real-time, bidirectional communication between the Sales and Inventory systems using WebSockets.

## Communication Flow

### Sales → Inventory (Existing)
- When sales are made in the sales system
- Stock is automatically decremented in inventory
- All inventory frontends receive real-time stock updates

### Inventory → Sales (New Implementation)
- When products are added/updated/deleted in inventory
- Sales system receives real-time updates
- Product lists, prices, and stock levels are updated automatically

## Architecture

```
Sales Frontend ←→ Sales Backend ←→ WebSocket Server ←→ Inventory Backend ←→ Inventory Frontend
     ↑                                    ↓
     └─────── Real-time Updates ──────────┘
```

## Implementation Details

### 1. Inventory WebSocket Server (`inventory-ws-server.js`)
- **Port**: 8081 (WebSocket) + 8082 (HTTP notifications)
- **Authentication**: Token-based (`sales-system-token`)
- **New Features**:
  - HTTP endpoints for inventory controller notifications
  - Message broadcasting to connected sales systems
  - Support for product CRUD operations

### 2. Inventory Controller Updates
- **New Dependencies**: HttpClient for sending notifications
- **New Method**: `NotifySalesSystem()` for WebSocket notifications
- **Updated Actions**:
  - `CreateProduct` → Notifies sales system
  - `UpdateProduct` → Notifies sales system
  - `DeleteProduct` → Notifies sales system
  - `AddStock` → Notifies sales system

### 3. Sales System WebSocket Service
- **Enhanced Message Handling**: Type-based message routing
- **New Message Types**:
  - `productAdded` - New product created in inventory
  - `productUpdated` - Product modified in inventory
  - `productDeleted` - Product removed from inventory
  - `stockUpdated` - Stock levels changed

### 4. Sales Frontend Components
- **Products.jsx**: Real-time product list updates
- **Sales.jsx**: Dashboard statistics and inventory updates
- **Shop.jsx**: Customer-facing product updates and cart management

## Message Types

### Inventory → Sales Messages

```javascript
// Product Added
{
  type: 'productAdded',
  product: {
    id: 'guid',
    name: 'Product Name',
    sku: 'SKU001',
    price: 99.99,
    stock: 100,
    description: 'Description'
  }
}

// Product Updated
{
  type: 'productUpdated',
  product: {
    id: 'guid',
    name: 'Updated Name',
    sku: 'SKU001',
    price: 89.99,
    stock: 95,
    description: 'Updated Description'
  }
}

// Product Deleted
{
  type: 'productDeleted',
  productId: 'guid'
}

// Stock Updated
{
  type: 'stockUpdated',
  sku: 'SKU001',
  stock: 85
}
```

## Setup Instructions

### 1. Start Services in Order
1. **PostgreSQL Database** (Inventory)
2. **MySQL Database** (Sales)
3. **Inventory Backend**: `dotnet run`
4. **Inventory WebSocket Server**: `node inventory-ws-server.js`
5. **Sales Backend**: `npm start`
6. **Inventory Frontend**: `npm run serve`
7. **Sales Frontend**: `npm run dev`

### 2. Test Two-Way Communication
```bash
# Run the test script
node test-two-way-websocket.js

# In another terminal, make changes in inventory system
# Observe real-time updates in sales system
```

## Real-Time Features

### ✅ Implemented
- **Stock Updates**: Inventory changes reflect in sales immediately
- **Product Management**: Add/edit/delete products sync across systems
- **Price Changes**: Updated prices appear in sales system instantly
- **Product Availability**: Out-of-stock items update in real-time

### 🔄 Automatic Updates
- **Sales Dashboard**: KPIs and statistics update automatically
- **Product Lists**: Inventory changes reflect without page refresh
- **Shopping Cart**: Stock validation and updates in real-time
- **POS System**: Product availability and pricing stay current

## Error Handling
- **Connection Loss**: Automatic reconnection with exponential backoff
- **Message Failures**: Graceful degradation with console logging
- **Authentication**: Token validation and unauthorized connection rejection
- **Database Errors**: Transaction rollback and error reporting

## Testing
- Use `test-two-way-websocket.js` to verify communication
- Monitor browser console for WebSocket connection logs
- Check inventory system logs for notification sending
- Verify real-time updates across multiple browser tabs

## Troubleshooting
1. **WebSocket Connection Failed**: Check if inventory WebSocket server is running on port 8081
2. **No Real-Time Updates**: Verify HTTP notification server is running on port 8082
3. **Authentication Errors**: Ensure token `sales-system-token` is correctly configured
4. **Database Issues**: Check PostgreSQL and MySQL connections
5. **CORS Errors**: Verify CORS settings in both backend services