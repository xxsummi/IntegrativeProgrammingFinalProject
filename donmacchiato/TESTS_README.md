Frontend tests

Requirements:
- Node.js and npm
- Install dependencies: `npm install`

Run unit tests (Vitest):

```bash
cd donmacchiato
npm install
npm test
```

Run Cypress E2E (if installed):

```bash
cd donmacchiato
npx cypress open
```

Notes:
- `src/services/api.test.js` contains example tests that mock `fetch` and localStorage.
- `src/Pages/Sales.test.jsx` contains a simple component test for the Sales page.
- The Cypress test (`cypress/e2e/sales.cy.js`) demonstrates programmatically setting localStorage to bypass login and checking the Sales page UI. Adjust selectors if your login flow differs.
