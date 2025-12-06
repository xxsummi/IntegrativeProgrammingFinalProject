import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5099/inventoryHub', {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      await this.connection.start();
      console.log('✅ Connected to SignalR hub');
      
      await this.connection.invoke('JoinInventoryGroup');
    } catch (err) {
      console.error('SignalR connection error:', err);
    }
  }

  on(event, callback) {
    if (this.connection) {
      this.connection.on(event, callback);
    }
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
    }
  }
}

const signalRService = new SignalRService();
export default signalRService;