// sales.js
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'buyer1',
  password: '12345',
  database: 'sales_db',
  connectionLimit: 5
});

// Fixed product list
const PRODUCTS = [
  { sku: 'DONMAC39', name: 'Don Macchiato', price: 39.00 },
  { sku: 'MOCHA01', name: 'Mocha', price: 39.00 },
  { sku: 'LATTE01', name: 'Cafe Latte', price: 39.00 },
  { sku: 'ESPRESSO01', name: 'Espresso', price: 39.00 },
  { sku: 'CAPPU01', name: 'Cappuccino', price: 39.00 },
  { sku: 'AMERIC01', name: 'Americano', price: 39.00 },
  { sku: 'MACCHI01', name: 'Macchiato', price: 39.00 },
  { sku: 'HOTCHO01', name: 'Hot Chocolate', price: 39.00 },
  { sku: 'ICELAT01', name: 'Iced Latte', price: 39.00 },
];

// Get products
async function getProducts() {
  return PRODUCTS;
}

// Buy coffee
async function buyCoffee(user_id, product_sku, quantity) {
  let conn;
  try {
    conn = await pool.getConnection();

    // Find product in the fixed PRODUCTS array
    const product = PRODUCTS.find(p => p.sku === product_sku);
    if (!product) throw new Error("Product not found");

    const total = quantity * product.price;

    await conn.beginTransaction();

    const saleResult = await conn.query(
      'INSERT INTO sales (user_id, total) VALUES (?, ?)',
      [user_id, total]
    );
    const saleID = saleResult.insertId;

    await conn.query(
      'INSERT INTO sale_items (sale_id, product_sku, quantity, prod_name, price) VALUES (?, ?, ?, ?, ?)',
      [saleID, product.sku, quantity, product.name, product.price]
    );

    await conn.commit();

    return { saleID, user_id, product: product.name, quantity, total };

  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { getProducts, buyCoffee };
