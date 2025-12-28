// Test script for two-way WebSocket communication
const WebSocket = require('ws');

console.log('🧪 Testing two-way WebSocket communication...');

// Connect to inventory WebSocket server as sales system
const ws = new WebSocket('ws://localhost:8081?token=sales-system-token');

ws.on('open', () => {
  console.log('✅ Connected to inventory WebSocket server');
  
  // Test sending a sale message (Sales → Inventory)
  const saleData = {
    items: [
      { product_sku: 'TEST001', quantity: 2 }
    ]
  };
  
  console.log('📤 Sending sale data to inventory:', saleData);
  ws.send(JSON.stringify(saleData));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📨 Received message from inventory:', message);
    
    switch(message.type) {
      case 'stockUpdated':
        console.log(`📊 Stock updated: ${message.sku} → ${message.stock}`);
        break;
      case 'productAdded':
        console.log('➕ Product added:', message.product);
        break;
      case 'productUpdated':
        console.log('✏️ Product updated:', message.product);
        break;
      case 'productDeleted':
        console.log('🗑️ Product deleted:', message.productId);
        break;
      default:
        console.log('📋 Other message:', message);
    }
  } catch (err) {
    console.error('❌ Failed to parse message:', err);
  }
});

ws.on('error', (error) => {
  console.error('🚨 WebSocket error:', error);
});

ws.on('close', (code, reason) => {
  console.log(`❌ Connection closed. Code: ${code}, Reason: ${reason}`);
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n👋 Closing WebSocket connection...');
  ws.close();
  process.exit(0);
});

console.log('🔄 Listening for inventory updates...');
console.log('Press Ctrl+C to exit');