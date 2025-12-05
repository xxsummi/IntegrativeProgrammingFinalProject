# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Integrating sales-frontend (CRA)

If you want to serve or preview the Create-React-App application (`sales-frontend`) within this Vite app, there's a helper script at the repo root that builds the CRA app and copies its production files into `public/sales-frontend` so they can be served statically.

From the repository root run:

```bash
./scripts/merge-frontends.sh
```

After running the script, the built CRA site will be available under `donmacchiato/public/sales-frontend` and you can open the static files while running a static server or inspect them. This is a quick way to host both frontends together for demos. For a long-term solution, consider porting CRA components into `donmacchiato/src` and use Vite for the full single-codebase dev experience.
