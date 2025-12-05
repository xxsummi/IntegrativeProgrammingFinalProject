// Simple WebSocket connection test script
const WebSocket = require('ws');

console.log('🧪 Testing WebSocket Connection...\n');

// Test 1: Valid connection
console.log('Test 1: Connecting with valid token...');
const ws1 = new WebSocket('ws://localhost:8080?token=sales-system-token');

ws1.on('open', () => {
  console.log('✅ Connected successfully with valid token');
  
  // Test sending sale data
  const testSale = {
    items: [
      { product_sku: 'TEST-SKU', quantity: 1 }
    ]
  };
  
  console.log('📤 Sending test sale data:', testSale);
  ws1.send(JSON.stringify(testSale));
});

ws1.on('message', (data) => {
  console.log('📨 Received response:', JSON.parse(data));
  ws1.close();
});

ws1.on('error', (error) => {
  console.log('❌ Connection error:', error.message);
});

ws1.on('close', (code, reason) => {
  console.log(`🔌 Connection closed. Code: ${code}, Reason: ${reason}\n`);
  
  // Test 2: Invalid token
  console.log('Test 2: Connecting with invalid token...');
  const ws2 = new WebSocket('ws://localhost:8080?token=invalid');
  
  ws2.on('open', () => {
    console.log('⚠️ Unexpected: Connected with invalid token');
  });
  
  ws2.on('close', (code) => {
    if (code === 1008) {
      console.log('✅ Correctly rejected invalid token (code 1008)');
    } else {
      console.log('❌ Unexpected close code:', code);
    }
    process.exit(0);
  });
  
  ws2.on('error', (error) => {
    console.log('Expected error for invalid token:', error.message);
  });
});