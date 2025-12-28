class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.listeners = new Map();
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      console.log('Attempting to connect to WebSocket server...');
      this.ws = new WebSocket('ws://localhost:8081?token=sales-system-token');
      
      this.ws.onopen = () => {
        console.log('✅ Connected to inventory WebSocket');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', data);
          
          // Handle different message types
          switch(data.type) {
            case 'stockUpdated':
              this.emit('stockUpdated', data);
              break;
            case 'productAdded':
              this.emit('productAdded', data);
              break;
            case 'productUpdated':
              this.emit('productUpdated', data);
              break;
            case 'productDeleted':
              this.emit('productDeleted', data);
              break;
            default:
              this.emit('message', data);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`❌ WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        this.ws = null;
        this.emit('disconnected');
        if (event.code !== 1008 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('🚨 WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting to WebSocket... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.log('⚠️ Max reconnection attempts reached. WebSocket will not reconnect.');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const wsService = new WebSocketService();

export const connectWebSocket = () => wsService.connect();
export const disconnectWebSocket = () => wsService.disconnect();
export const sendWebSocketMessage = (data) => wsService.send(data);

export default wsService;