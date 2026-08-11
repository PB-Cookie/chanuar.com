# Product boundaries

- `src/app` owns startup, routing, route metadata, and global error surfaces.
- `src/products/skinfolio` and `src/products/food` own their routes, APIs, models, components, and CSS.
- Products may import narrowly scoped modules from `src/shared`; they must not import each other or `src/app`.
- Supabase snake_case data is normalized inside product API adapters. UI and model code use camelCase domain types.
- Keep state local to a product. Add shared UI or a global store only after concrete cross-product reuse exists.
- Route modules expose only React Router route keys (`Component`, `loader`, and `ErrorBoundary`). Exercise them with a memory router instead of adding direct-render fallbacks or test-only exports.
- Loaders own initial reads. User-triggered mutations stay in event handlers and revalidate loader data after success.
