Backend tests

Requirements:
- Node.js and npm
- Install dev dependencies: `npm install`

Run tests:

```bash
cd backend
npm install
npm test
```

Notes:
- Tests use Jest + Supertest.
- The test suite imports the Express `app` (so `src/server.js` exports the app). If you need DB-backed tests, set environment variables for a test DB and seed data before running tests.
- For auth-protected routes, you can set `TEST_JWT_SECRET` or `JWT_SECRET` and generate a token for a seeded test user.
