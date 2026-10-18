# SwiftRoute

SwiftRoute is an npm-workspaces monorepo with independently buildable customer, driver, and admin web apps. Shared Supabase services, authentication screens, and visual design primitives live in workspace packages.

## Workspace map

- `apps/customer` — marketing homepage, customer delivery dashboard, account registration and sign-in
- `apps/driver` — driver workspace and application review status
- `apps/admin` — driver approvals and delivery operations
- `packages/core` — Supabase client, authentication, delivery services, and portal URL helpers
- `packages/auth-ui` — shared login, registration, and driver application screens
- `packages/design-system` — shared Tailwind theme, SwiftRoute styles, dashboard shell, and UI primitives

## Local development

Copy `.env.example` to `.env` and provide the Supabase project URL and publishable key. Each app reads the root `.env`.

```sh
npm install
npm run dev:customer
npm run dev:driver
npm run dev:admin
```

The apps use separate local ports: customer `5173`, driver `5174`, and admin `5175`.

## Build and type-check

```sh
npm run typecheck
npm run build
```

Build targets can also be run individually with `npm run build:customer`, `npm run build:driver`, and `npm run build:admin`. Each app emits a separate `dist` directory under its workspace.

## Deployment

Deploy each app workspace as its own Vite site, setting its project root to the corresponding `apps/<role>` directory. Provide the Supabase variables to each build. Set `VITE_CUSTOMER_APP_URL`, `VITE_DRIVER_APP_URL`, and `VITE_ADMIN_APP_URL` to the deployed portal origins to enable cross-portal sign-in links. Without those optional URLs, a user signed in to the wrong role app receives a clear instruction to use the matching workspace.
