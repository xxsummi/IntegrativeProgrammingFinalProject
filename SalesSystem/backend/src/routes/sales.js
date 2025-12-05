// routes/sales.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");
const axios = require("axios");
const WebSocket = require("ws");

// Inventory system config
const INVENTORY_API_BASE = "http://localhost:5099/api/products"; // Inventory API
const INVENTORY_WS_URL = "ws://localhost:8080"; // Inventory WebSocket
let ws;

// Connect to Inventory WebSocket
function connectWS() {
  const wsUrl = `${INVENTORY_WS_URL}?token=sales-system-token`;
  ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    console.log("Connected to Inventory WebSocket server");
  });

  ws.on("message", (message) => {
    console.log("Message from Inventory WS:", message.toString());
  });

  ws.on("close", (code, reason) => {
    console.log(`Inventory WS connection closed. Code: ${code}, Reason: ${reason}`);
    if (code !== 1008) { // Don't reconnect if unauthorized
      console.log("Reconnecting in 3s...");
      setTimeout(connectWS, 3000);
    }
  });

  ws.on("error", (err) => {
    console.error("Inventory WS error:", err);
    ws.close();
  });
}

// Initialize WebSocket connection
connectWS();


// ---------------------- ROUTES ----------------------

//GET /api/sales/products - fetch products from Inventory
router.get("/products", auth, async (req, res) => {
  try {
    const response = await axios.get(INVENTORY_API_BASE);
    // Extract products array from inventory response
    const products = response.data.products || [];
    return res.json(products);
  } catch (err) {
    console.error("Failed to fetch products from Inventory:", err.message);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
});

//GET /api/sales/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT si.product_sku, p.name AS product_name, SUM(si.quantity) AS total_quantity
       FROM sale_items si
       JOIN products p ON p.sku = si.product_sku
       GROUP BY si.product_sku, p.name
       ORDER BY total_quantity DESC`
    );

    const normalized = rows.map((r) => ({
      product_sku: r.product_sku,
      product_name: r.product_name,
      total_quantity: Number(r.total_quantity || 0),
    }));

    return res.json(normalized);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//GET /api/sales/recent
router.get("/recent", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.user_id, u.name AS cashier, s.total, s.created_at
       FROM sales s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.created_at DESC
       LIMIT 5`
    );

    return res.json(rows);
  } catch (err) {
    console.error("Error fetching recent sales:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sales/embedded - for embedded frontend (no auth required)
router.get("/embedded", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.user_id, u.name AS cashier, s.total, s.created_at
       FROM sales s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.created_at DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sales/embedded/stats - for embedded frontend (no auth required)
router.get("/embedded/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT si.product_sku, p.name AS product_name, SUM(si.quantity) AS total_quantity
       FROM sale_items si
       JOIN products p ON p.sku = si.product_sku
       GROUP BY si.product_sku, p.name
       ORDER BY total_quantity DESC`
    );

    const normalized = rows.map((r) => ({
      product_sku: r.product_sku,
      product_name: r.product_name,
      total_quantity: Number(r.total_quantity || 0),
    }));

    return res.json(normalized);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//GET /api/sales (admin/manager only)
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.user_id, u.name AS cashier, s.total, s.created_at
       FROM sales s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.created_at DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//POST /api/sales - create a sale and notify Inventory
router.post("/", auth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items are required" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    let saleTotal = 0;
    const saleItemsToInsert = [];

    // Validate stock and compute totals via Inventory API
    for (const item of items) {
      const { product_sku, quantity } = item;
      if (!product_sku || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid item payload");
      }

      // Fetch product info from Inventory
      const inventoryResponse = await axios.get(`${INVENTORY_API_BASE}/${encodeURIComponent(product_sku)}`);
      const product = inventoryResponse.data;

      if (!product) throw new Error(`Product not found: ${product_sku}`);
      if (product.stock < quantity) throw new Error(`Insufficient stock for ${product_sku}`);

      const lineTotal = Number(product.price) * quantity;
      saleTotal += lineTotal;
      saleItemsToInsert.push({
        product_sku: product.sku,
        quantity,
        unit_price: product.price,
      });
    }

    // Insert sale
    const [saleResult] = await conn.query(
      "INSERT INTO sales (user_id, total) VALUES (?, ?)",
      [req.user.id, saleTotal]
    );
    const saleId = saleResult.insertId;

    // Insert sale items
    for (const si of saleItemsToInsert) {
      await conn.query(
        "INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [saleId, si.product_sku, si.quantity, si.unit_price]
      );
    }

    await conn.commit();

    // Send sale info to Inventory WS to decrement stock
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ saleId, items: saleItemsToInsert }));
    }

    return res.status(201).json({
      id: saleId,
      user_id: req.user.id,
      total: saleTotal,
      items: saleItemsToInsert,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    if (conn) await conn.rollback();
    const message = err?.message || "Failed to create sale";
    return res.status(400).json({ message });
  } finally {
    if (conn) conn.release();
  }
});

//GET /api/sales/:id
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const [salesRows] = await pool.query(
      `SELECT s.id, s.user_id, u.name AS cashier, s.total, s.created_at
       FROM sales s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [id]
    );
    if (salesRows.length === 0)
      return res.status(404).json({ message: "Sale not found" });

    const sale = salesRows[0];

    if (!(req.user.role === "admin" || req.user.id === sale.user_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [itemRows] = await pool.query(
      `SELECT si.id, si.product_sku, p.name AS product_name, si.quantity, si.unit_price
       FROM sale_items si
       JOIN products p ON p.sku = si.product_sku
       WHERE si.sale_id = ?
       ORDER BY si.id ASC`,
      [id]
    );

    return res.json({ ...sale, items: itemRows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
