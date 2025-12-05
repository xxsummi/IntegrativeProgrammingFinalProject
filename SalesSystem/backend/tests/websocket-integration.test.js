const WebSocket = require('ws');
const axios = require('axios');

describe('WebSocket Integration Tests', () => {
  let ws;
  const WS_URL = 'ws://localhost:8080?token=sales-system-token';
  const SALES_API = 'http://localhost:3000/api';

  beforeAll(async () => {
    // Wait for servers to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  test('WebSocket connection with valid token', (done) => {
    ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  test('WebSocket rejects invalid token', (done) => {
    const invalidWs = new WebSocket('ws://localhost:8080?token=invalid');
    
    invalidWs.on('close', (code) => {
      expect(code).toBe(1008); // Unauthorized
      done();
    });
  });

  test('Stock update via WebSocket', (done) => {
    ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      const saleData = {
        items: [
          { product_sku: 'TEST-001', quantity: 2 }
        ]
      };
      
      ws.send(JSON.stringify(saleData));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data);
      expect(response.status).toBe('success');
      expect(response.processed).toBe(1);
      done();
    });
  });

  test('End-to-end sale processing', async () => {
    // Create a sale via API
    const saleData = {
      customer_name: 'Test Customer',
      items: [
        { product_sku: 'TEST-001', quantity: 1, price: 10.00 }
      ]
    };

    const response = await axios.post(`${SALES_API}/sales`, saleData);
    expect(response.status).toBe(201);
    
    // Verify WebSocket was notified (check logs)
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});