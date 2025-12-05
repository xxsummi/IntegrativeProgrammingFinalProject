import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import wsService from './src/services/websocket.js';

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  readyState: 1, // OPEN
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}));

describe('WebSocket Service', () => {
  let mockWs;

  beforeEach(() => {
    mockWs = {
      readyState: 1,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null
    };
    global.WebSocket = vi.fn(() => mockWs);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect to WebSocket server', () => {
    wsService.connect();
    
    expect(global.WebSocket).toHaveBeenCalledWith(
      'ws://localhost:8080?token=sales-system-token'
    );
  });

  it('should handle connection success', () => {
    const connectSpy = vi.fn();
    wsService.on('connected', connectSpy);
    
    wsService.connect();
    mockWs.onopen();
    
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should send sale data correctly', () => {
    wsService.connect();
    mockWs.readyState = 1; // OPEN
    
    const saleData = { items: [{ sku: 'TEST', quantity: 1 }] };
    wsService.send(saleData);
    
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(saleData));
  });

  it('should handle reconnection on close', () => {
    const reconnectSpy = vi.spyOn(wsService, 'reconnect');
    
    wsService.connect();
    mockWs.onclose({ code: 1006 }); // Abnormal closure
    
    expect(reconnectSpy).toHaveBeenCalled();
  });
});