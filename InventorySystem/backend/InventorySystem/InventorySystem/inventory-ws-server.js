// inventory-ws-server.js
const WebSocket = require("ws");
const { Pool } = require("pg");

// WebSocket server port
const PORT = 8080;

// PostgreSQL pool using your appsettings.json connection info
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "InventorySystem",
  user: "postgres",
  password: "admin",
});

// Start WebSocket server
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`Inventory WebSocket server running on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log("Sales system connected via WebSocket");

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
  });
});

// Function to decrement stock in PostgreSQL
async function decrementStock(sku, qty) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check current stock
    const res = await client.query(
      "SELECT stock FROM products WHERE sku = $1 FOR UPDATE",
      [sku]
    );

    if (res.rows.length === 0) {
      console.warn(`SKU not found: ${sku}`);
      await client.query("ROLLBACK");
      return false;
    }

    const currentStock = res.rows[0].stock;

    if (currentStock < qty) {
      console.warn(`Insufficient stock for SKU ${sku}`);
      await client.query("ROLLBACK");
      return false;
    }

    // Decrement stock
    await client.query(
      "UPDATE products SET stock = stock - $1, \"UpdatedAt\" = NOW() WHERE sku = $2",
      [qty, sku]
    );

    await client.query("COMMIT");
    console.log(`Decremented ${qty} of ${sku}. New stock: ${currentStock - qty}`);
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DB error:", err);
    return false;
  } finally {
    client.release();
  }
}
