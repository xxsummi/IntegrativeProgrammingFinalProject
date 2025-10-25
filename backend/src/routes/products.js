const express = require('express');
const router = express.Router();
const pool = require('../db');  // go up one folder to reach db.js
const auth = require('../middleware/auth');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT sku, name, unit_price, stock FROM products'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// PATCH /api/products/:sku - update product; if stock decreases, record a sale for the difference
router.patch('/:sku', auth, async (req, res) => {
  const oldSku = req.params.sku;
  const { sku: newSku, name, unit_price, stock } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT sku, name, unit_price, stock FROM products WHERE sku = ? FOR UPDATE', [oldSku]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = rows[0];
    const currentStock = Number(product.stock);
    const newStock = Number(stock);

    // If stock decreased, insert a sale and sale_items for the difference
    let saleInfo = null;
    if (!Number.isInteger(newStock) || newStock < 0) {
      throw new Error('Invalid stock value');
    }

    if (newStock < currentStock) {
      const qtySold = currentStock - newStock;
      const unitPrice = Number(product.unit_price);
      const saleTotal = unitPrice * qtySold;

      const [saleResult] = await conn.query('INSERT INTO sales (user_id, total) VALUES (?, ?)', [req.user.id, saleTotal]);
      const saleId = saleResult.insertId;
      await conn.query('INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES (?, ?, ?, ?)', [saleId, product.sku, qtySold, unitPrice]);

      saleInfo = { id: saleId, product_sku: product.sku, quantity: qtySold, unit_price: unitPrice, total: saleTotal };
    }

    // Update product (allow changing SKU/name/price/stock)
    await conn.query('UPDATE products SET sku = ?, name = ?, unit_price = ?, stock = ? WHERE sku = ?', [newSku || product.sku, name || product.name, unit_price ?? product.unit_price, newStock, oldSku]);

    await conn.commit();

    // Return updated product info and sale info (if any)
    const [updatedRows] = await pool.query('SELECT sku, name, unit_price, stock FROM products WHERE sku = ?', [newSku || product.sku]);
    return res.json({ product: updatedRows[0], sale: saleInfo });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    // forward to global error handler
    return next(err);
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
