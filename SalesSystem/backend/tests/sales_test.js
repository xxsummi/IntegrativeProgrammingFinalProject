// backend/tests/sales.test.js
const request = require('supertest');
const createServer = require('../src/server'); // or require the express app export
const pool = require('../src/db');

let app;

beforeAll(async () => {
  // If your server file exports the app (not just app.listen), require it here.
  // Example: in server.js export `module.exports = app;` and in test require the app
  app = createServer(); // or require('../src/server') if it exports the express app

  // Optionally prepare test DB: run migrations or seed test data
  // await pool.query('DELETE FROM sale_items');
  // await pool.query('DELETE FROM sales');
  // await pool.query('DELETE FROM products');
  // await pool.query(\"INSERT INTO products (sku,name,unit_price,stock) VALUES ('TST001','Test',10.00,100)\");
});

afterAll(async () => {
  // Clean up DB connections
  await pool.end();
});

describe('POST /api/sales', () => {
  it('creates a sale and returns 201', async () => {
    // You need a valid token if auth middleware is used; you can mock auth middleware
    // or generate a JWT with your SECRET that corresponds to a test user.
    const token = 'Bearer ' + process.env.TEST_JWT_TOKEN; // set in CI or test env

    const payload = {
      items: [{ product_sku: 'TST001', quantity: 2 }]
    };

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', token)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('total');
    expect(res.body.items).toBeInstanceOf(Array);
  });
});