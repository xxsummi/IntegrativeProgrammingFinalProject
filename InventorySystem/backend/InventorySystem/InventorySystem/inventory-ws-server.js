// inventory-ws-server.js
const WebSocket = require("ws");
const { Pool } = require("pg");
const axios = require("axios");
const express = require("express");
const cors = require("cors");

// Create Express app for HTTP endpoints
const app = express();
app.use(cors());
app.use(express.json());

// WebSocket server port
const PORT = 8081;
const HTTP_PORT = 8082;

// PostgreSQL pool using your appsettings.json connection info
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "InventorySystem",
  user: "postgres",
  password: "password",
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Start WebSocket server
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`Inventory WebSocket server running on ws://localhost:${PORT}`);
});

// Track connected clients
const clients = new Set();

wss.on("connection", (ws, req) => {
  // Basic authentication check
  const token = req.url?.split('token=')[1];
  if (!token || token !== 'sales-system-token') {
    console.log("Unauthorized WebSocket connection attempt, token:", token);
    ws.close(1008, "Unauthorized");
    return;
  }
  
  console.log("Sales system connected via WebSocket with token:", token);
  clients.add(ws);
  
  // Keep connection alive with ping/pong
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received sale data:", data);

      let processedCount = 0;

      for (const item of data.items) {
        const { product_sku, quantity } = item;
        const success = await decrementStock(product_sku, quantity);
        if (success) processedCount++;
      }

      // Send acknowledgment back to Sales
      ws.send(JSON.stringify({ status: "success", processed: processedCount }));
    } catch (err) {
      console.error("Error processing sale data:", err);
      ws.send(JSON.stringify({ status: "error", message: err.message }));
    }
  });

  ws.on("close", () => {
    console.log("Sales system disconnected");
    clients.delete(ws);
  });
});

// Function to broadcast to all connected clients
function broadcastToClients(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Function to notify sales system about inventory changes
function notifySalesSystem(message) {
  broadcastToClients(message);
}

// Export function for use by inventory controller
module.exports = { notifySalesSystem };

// HTTP endpoints for inventory controller to notify sales system
app.post('/notify/product-updated', (req, res) => {
  const { product } = req.body;
  notifySalesSystem({
    type: 'productUpdated',
    product: product
  });
  res.json({ success: true });
});

app.post('/notify/product-added', (req, res) => {
  const { product } = req.body;
  notifySalesSystem({
    type: 'productAdded',
    product: product
  });
  res.json({ success: true });
});

app.post('/notify/product-deleted', (req, res) => {
  const { productId } = req.body;
  notifySalesSystem({
    type: 'productDeleted',
    productId: productId
  });
  res.json({ success: true });
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`Inventory HTTP notification server running on http://localhost:${HTTP_PORT}`);
});

// Function to decrement stock in PostgreSQL
async function decrementStock(sku, qty) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check current stock
    const res = await client.query(
      "SELECT \"Stock\" FROM \"Products\" WHERE \"Sku\" = $1 FOR UPDATE",
      [sku]
    );

    if (res.rows.length === 0) {
      console.warn(`SKU not found: ${sku}`);
      await client.query("ROLLBACK");
      return false;
    }

    const currentStock = res.rows[0]["Stock"];

    if (currentStock < qty) {
      console.warn(`Insufficient stock for SKU ${sku}`);
      await client.query("ROLLBACK");
      return false;
    }

    // Decrement stock
    await client.query(
      "UPDATE \"Products\" SET \"Stock\" = \"Stock\" - $1, \"UpdatedAt\" = NOW() WHERE \"Sku\" = $2",
      [qty, sku]
    );

    await client.query("COMMIT");
    const newStock = currentStock - qty;
    console.log(`Decremented ${qty} of ${sku}. New stock: ${newStock}`);
    
    // Broadcast stock update to all connected clients
    broadcastToClients({
      type: 'stockUpdated',
      sku: sku,
      stock: newStock
    });
    
    // Notify SignalR hub about stock update
    try {
      await axios.post('http://localhost:5099/api/notify/stock-update', {
        sku: sku,
        stock: newStock
      });
    } catch (err) {
      console.warn('Failed to notify SignalR hub:', err.message);
    }
    
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DB error:", err);
    return false;
  } finally {
    client.release();
  }
}
