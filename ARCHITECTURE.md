# Product boundaries

- `src/app` owns startup, routing, route metadata, and global error surfaces.
- `src/products/skinfolio` and `src/products/food` own their routes, APIs, models, components, and CSS.
- Products may import narrowly scoped modules from `src/shared`; they must not import each other or `src/app`.
- Supabase snake_case data is normalized inside product API adapters. UI and model code use camelCase domain types.
- Keep state local to a product. Add shared UI or a global store only after concrete cross-product reuse exists.
