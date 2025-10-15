// routes/sales.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");

// ✅ GET /api/sales/stats - aggregated sold quantities per product (any authenticated user)
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

// ✅ GET /api/sales/recent - last 5 sales with basic info
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

// ✅ GET /api/sales - admin or manager can view all
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

// ✅ POST /api/sales - create a sale with items, decrement stock transactionally
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

    // Validate stock and compute totals
    for (const item of items) {
      const { product_sku, quantity } = item;
      if (!product_sku || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid item payload");
      }

      // Lock the product row FOR UPDATE
      const [productRows] = await conn.query(
        "SELECT sku, unit_price, stock FROM products WHERE sku = ? FOR UPDATE",
        [product_sku]
      );
      if (productRows.length === 0) {
        throw new Error(`Product not found: ${product_sku}`);
      }
      const product = productRows[0];
      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for ${product_sku}`);
      }

      const lineTotal = Number(product.unit_price) * quantity;
      saleTotal += lineTotal;
      saleItemsToInsert.push({
        product_sku: product.sku,
        quantity,
        unit_price: product.unit_price,
      });
    }

    // Insert sale
    const [saleResult] = await conn.query(
      "INSERT INTO sales (user_id, total) VALUES (?, ?)",
      [req.user.id, saleTotal]
    );
    const saleId = saleResult.insertId;

    // Insert sale items and decrement stock
    for (const si of saleItemsToInsert) {
      await conn.query(
        "INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [saleId, si.product_sku, si.quantity, si.unit_price]
      );
      await conn.query("UPDATE products SET stock = stock - ? WHERE sku = ?", [
        si.quantity,
        si.product_sku,
      ]);
    }

    await conn.commit();

    return res.status(201).json({
      id: saleId,
      user_id: req.user.id,
      total: saleTotal,
      items: saleItemsToInsert,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    if (conn) await conn.rollback();
    const message =
      err && err.message ? err.message : "Failed to create sale";
    return res.status(400).json({ message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ GET /api/sales/:id - get a sale with its items (auth required; admin or owner)
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
    // Only admin or owner can view
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

    return res.json({
      ...sale,
      items: itemRows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
