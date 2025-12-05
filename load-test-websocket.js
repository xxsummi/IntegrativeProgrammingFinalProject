// Load test for WebSocket connections
const WebSocket = require('ws');

const CONCURRENT_CONNECTIONS = 10;
const MESSAGES_PER_CONNECTION = 5;
const WS_URL = 'ws://localhost:8080?token=sales-system-token';

console.log(`🚀 Starting load test: ${CONCURRENT_CONNECTIONS} connections, ${MESSAGES_PER_CONNECTION} messages each\n`);

let completedConnections = 0;
let totalMessages = 0;
let successfulMessages = 0;

function createConnection(id) {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let messagesSent = 0;
    let messagesReceived = 0;

    ws.on('open', () => {
      console.log(`Connection ${id}: Connected`);
      
      // Send multiple test messages
      const interval = setInterval(() => {
        if (messagesSent < MESSAGES_PER_CONNECTION) {
          const testData = {
            items: [
              { product_sku: `TEST-${id}-${messagesSent}`, quantity: 1 }
            ]
          };
          
          ws.send(JSON.stringify(testData));
          messagesSent++;
          totalMessages++;
        } else {
          clearInterval(interval);
        }
      }, 100);
    });

    ws.on('message', (data) => {
      messagesReceived++;
      successfulMessages++;
      
      if (messagesReceived === MESSAGES_PER_CONNECTION) {
        console.log(`Connection ${id}: Completed (${messagesReceived}/${messagesSent})`);
        ws.close();
        resolve();
      }
    });

    ws.on('error', (error) => {
      console.log(`Connection ${id}: Error - ${error.message}`);
      resolve();
    });

    ws.on('close', () => {
      completedConnections++;
      if (completedConnections === CONCURRENT_CONNECTIONS) {
        console.log('\n📊 Load Test Results:');
        console.log(`Total connections: ${CONCURRENT_CONNECTIONS}`);
        console.log(`Total messages sent: ${totalMessages}`);
        console.log(`Successful responses: ${successfulMessages}`);
        console.log(`Success rate: ${((successfulMessages/totalMessages)*100).toFixed(2)}%`);
        process.exit(0);
      }
    });
  });
}

// Create all connections simultaneously
const connections = [];
for (let i = 1; i <= CONCURRENT_CONNECTIONS; i++) {
  connections.push(createConnection(i));
}

Promise.all(connections).then(() => {
  console.log('All connections completed');
});