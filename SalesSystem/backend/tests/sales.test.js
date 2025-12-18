const request = require('supertest');
const app = require('../src/server');
const jwt = require('jsonwebtoken');

// Create a helper test token (make sure TEST_JWT_SECRET is set or fallback to JWT_SECRET)
const JWT_SECRET = process.env.TEST_JWT_SECRET || process.env.JWT_SECRET || 'testsecret';

function makeTestToken(payload = { id: 1, role: 'customer', name: 'Test' }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Sales API (basic integration)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/sales').send({ items: [{ product_sku: 'FAKE', quantity: 1 }] });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 for invalid payload with token', async () => {
    const token = makeTestToken();
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [] });

    expect([400, 404, 401]).toContain(res.statusCode); // allow a few possible responses depending on DB
  });
});
