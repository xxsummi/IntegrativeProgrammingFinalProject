// routes/sales.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");
const axios = require("axios");
const WebSocket = require("ws");

// Inventory system config
const INVENTORY_API_BASE = "http://localhost:5099/api/products";
const INVENTORY_WS_URL = "ws://localhost:8081";
let ws;

/* =======================
   WebSocket connection
======================= */
function connectWS() {
  ws = new WebSocket(`${INVENTORY_WS_URL}?token=sales-system-token`);

  ws.on("open", () => console.log("Connected to Inventory WebSocket"));
  ws.on("close", () => setTimeout(connectWS, 3000));
  ws.on("error", err => console.error("Inventory WS error:", err));
}

connectWS();

/* =======================
   ROUTES
======================= */

// GET /api/sales/products (from Inventory)
router.get("/products", auth, async (req, res) => {
  try {
    const response = await axios.get(INVENTORY_API_BASE);
    res.json(response.data.products || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/sales/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT product_name, SUM(quantity) AS total_quantity
      FROM sale_items
      GROUP BY product_name
      ORDER BY total_quantity DESC
    `);

    res.json(rows.map(r => ({
      product_name: r.product_name,
      total_quantity: Number(r.total_quantity)
    })));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sales/recent
router.get("/recent", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        si.id,
        si.product_name,
        si.quantity,
        si.unit_price,
        s.id AS sale_id,
        s.created_at,
        u.name AS cashier
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sales/embedded
router.get("/embedded", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, u.name AS cashier, s.total, s.created_at
      FROM sales s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
      LIMIT 100
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sales/embedded/stats
router.get("/embedded/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT SUM(quantity) AS total_quantity
      FROM sale_items
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sales/embedded/summary
router.get("/embedded/summary", async (req, res) => {
  try {
    const [[summary]] = await pool.query(`
      SELECT COUNT(*) AS total_sales, SUM(total) AS total_revenue
      FROM sales
    `);

    res.json({
      total_sales: Number(summary.total_sales || 0),
      total_revenue: Number(summary.total_revenue || 0)
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/sales
router.post("/", auth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "Items required" });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let saleTotal = 0;
    const saleItems = [];

    for (const item of items) {
      const { sku, quantity } = item;

      const { data: product } = await axios.get(`${INVENTORY_API_BASE}/${sku}`);

      if (product.stock < quantity)
        throw new Error(`Insufficient stock for ${product.name}`);

      saleTotal += product.price * quantity;



      saleItems.push({
        product_name: product.name,
        quantity,
        unit_price: product.price
      });
    }

    const [saleResult] = await conn.query(
      "INSERT INTO sales (user_id, total) VALUES (?, ?)",
      [req.user.id, saleTotal]
    );

    for (const item of saleItems) {
      await conn.query(
        `INSERT INTO sale_items (sale_id, product_name, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [saleResult.insertId, item.product_name, item.quantity, item.unit_price]
      );
    }
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        items: items.map(i => ({
          product_sku: i.sku,  // must match inventory WS
          quantity: i.quantity
        }))
      }));
    }

    await conn.commit();

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ saleId: saleResult.insertId, items }));
    }

    res.status(201).json({ id: saleResult.insertId, total: saleTotal });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/sales/:id
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;

  const [[sale]] = await pool.query(`
    SELECT s.id, u.name AS cashier, s.total, s.created_at
    FROM sales s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `, [id]);

  if (!sale) return res.status(404).json({ message: "Sale not found" });

  const [items] = await pool.query(`
    SELECT id, product_name, quantity, unit_price
    FROM sale_items
    WHERE sale_id = ?
  `, [id]);

  res.json({ ...sale, items });
});

module.exports = router;
