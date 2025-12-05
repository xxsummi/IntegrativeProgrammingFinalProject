import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

class SignalRService {
  constructor() {
    this.connection = null
    this.listeners = new Map()
  }

  async connect() {
    this.connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5099/inventoryHub')
      .configureLogging(LogLevel.Information)
      .build()

    this.connection.on('StockUpdated', (data) => {
      this.emit('stockUpdated', data)
    })

    this.connection.on('ProductAdded', (product) => {
      this.emit('productAdded', product)
    })

    this.connection.on('ProductDeleted', (productId) => {
      this.emit('productDeleted', productId)
    })

    try {
      await this.connection.start()
      console.log('SignalR Connected')
      await this.connection.invoke('JoinInventoryGroup')
    } catch (err) {
      console.error('SignalR Connection Error:', err)
      setTimeout(() => this.connect(), 5000)
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop()
    }
  }
}

export default new SignalRService()