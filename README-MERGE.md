This repo contains two frontends: `donmacchiato` (Vite) and `sales-frontend` (Create React App).

Quick helper to embed CRA build into Vite public folder:

From repo root:

```bash
./scripts/merge-frontends.sh
```

This will build `sales-frontend` and copy its `build` output into `donmacchiato/public/sales-frontend` so you can serve it as static files.

Recommendations:
- For local dev, prefer porting CRA components into `donmacchiato/src` and use `npm run dev` in `donmacchiato` for HMR and faster builds.
- Alternatively, run both frontends concurrently in separate terminals during development.
