# Repository Guidelines

## Architecture and ownership

This is one Vite application using React 19, React Router 7 Data Mode, and strict TypeScript. Keep the boundaries below intact when changing application structure.

- `src/app/` owns startup, routing, route metadata, body environments, the portfolio home, and
  the portfolio-styled 404 surface.
- `src/products/skinfolio/` and `src/products/food/` own their routes, APIs, models, components, and CSS.
- `src/shared/` is only for concrete cross-product needs. Do not move code there speculatively.
- Products may import `shared`, but must not import another product or `app`. ESLint enforces this boundary.
- Static assets belong in `public/`. Crawlable route entry points live in matching top-level route directories.
- Supabase migrations and database checks live in `supabase/migrations/` and `supabase/tests/`.
- The sibling `../food-scrapper/` repository is a separate Python 3.12/`uv` CLI that publishes restaurant catalogs to the same Supabase `food` schema.

## Current product and route map

- `/` is the Spanish portfolio for Carlos Alberto Chanuar Martínez (`@chanuar`). Its public
  contact details are `carlos@chanuar.com`, `github.com/chanuar`, and the LinkedIn URL already
  present in `src/app/Home.tsx`.
- `/skinfolio` owns the League of Legends collection application. It no longer renders at `/`.
- `/food`, `/food/options`, and `/food/admin` are the ordering product. The admin route is private
  UI and must remain `noindex`.
- Unknown routes render the portfolio-styled 404 and must remain `noindex`.
- `public/_redirects` rewrites only known SPA routes. Do not add a catch-all rewrite to
  `index.html`; unknown direct requests must retain a real 404 response.
- The portfolio and 404 share `PortfolioShell` and `portfolio.css`; product pages keep their own
  visual systems. Do not restyle Skinfolio or food to match the portfolio without an explicit UI
  request.
- Visible product and portfolio copy is Spanish. Internationalization is deferred; do not add an
  i18n dependency or translation layer until a second locale is requested.

## Application conventions

- Keep raw Supabase and scraper payloads inside product API adapters. UI and model code receive camelCase domain types.
- Route loaders perform initial reads. User-triggered mutations stay in event handlers and revalidate loader data after success.
- Treat expected empty states, such as no active food cycle, as loader data. Unexpected failures belong in route error boundaries.
- Keep state local to the product and closest owning component. Do not add global stores, service classes, repositories, dependency injection, barrel files, or speculative shared UI.
- Split files by cohesive responsibility, not an arbitrary line count. Do not create one-component wrapper files without a behavioral boundary.
- Use React Router `Link` or `NavLink` for internal route navigation. Use native anchors for
  same-page hash targets so browser scrolling works, and normal anchors for external destinations.
- Import product CSS through its lazy route module or layout. Scope selectors to the product body environment or use product-prefixed selectors.
- Every route surface needs one `<main id="main-content" tabIndex={-1}>`. Keep the shell skip link
  targeting it and preserve route-change focus restoration in `RouteEnvironment`.
- Preserve accessibility behavior: semantic controls and landmarks, keyboard navigation, visible
  focus, dialog focus trapping/restoration, validation focus, and announced loading/error states.
  Prefer native semantics over ARIA; do not put `aria-label` on generic `div` or `span` elements.

## Public routes and external contracts

The crawlable HTML entries are `index.html`, `skinfolio/index.html`, `food/index.html`, and
`food/options/index.html`. `food/admin/index.html` and `404.html` are deliberately non-indexable.
Static entry metadata must match the runtime metadata in `src/app/RouteEnvironment.tsx`.

Keep the portfolio identity in `src/app/Home.tsx`, root metadata, and the root `ProfilePage` JSON-LD
in sync. Only indexable public routes belong in `public/sitemap.xml`; `public/robots.txt` advertises
that sitemap. Canonical URLs use `https://chanuar.com` and omit trailing slashes except for `/`.

Changing a public route requires updating all of the following together:

- the React Router tree;
- its static HTML entry point and metadata;
- Vite build inputs;
- `public/_redirects` for direct loads and refreshes;
- route metadata/body-environment configuration;
- canonical metadata and `public/sitemap.xml` when the route is indexable;
- router, metadata, and direct-load tests.

Do not casually rename URLs, Supabase schemas, tables, RPCs, RPC parameters, local-storage keys, or scraper payload fields. Coordinate deliberate contract changes across the web app, migrations, tests, and scraper.

## TypeScript and formatting

- Application and test code is TypeScript (`.ts`/`.tsx`); do not add `.js`/`.jsx` under `src/`.
- Keep strict typing at trust boundaries. Do not replace validation with `any` or unchecked raw objects.
- Use `PascalCase` for React components and component files, `camelCase` for functions and variables, and uppercase names for true module-level constants.
- Prettier owns formatting. ESLint owns correctness and architectural import restrictions; do not disable rules globally to accommodate one file.

## Commands and verification

- `npm ci` installs locked dependencies; Node 20.19 or newer is required.
- `npm run dev` starts Vite.
- `npm run lint` runs ESLint with zero warnings allowed.
- `npm run format:check` verifies Prettier formatting.
- `npm run typecheck` runs strict TypeScript checks.
- `npm test` runs Vitest once in jsdom; `npm run test:watch` watches affected tests.
- `npm run build` type-checks and builds every configured HTML entry point.
- `supabase test db` runs SQL security and contract checks against a disposable local stack.
- From `../food-scrapper`, `uv run food-scrapper sync --restaurant <slug> --dry-run` validates a catalog without publishing it.

Place Vitest and Testing Library tests beside the code as `*.test.ts` or `*.test.tsx`. Prefer user-visible behavior and accessibility-oriented queries. Add focused regression coverage for non-trivial fixes. Before handoff, run lint, format check, tests, and build; also run database tests for migration, authorization, RPC, or RLS changes.

Husky runs lint-staged formatting/linting before commits and runs `typecheck` plus the full test
suite before pushes. Do not bypass these hooks to land a change.

## Database and security

- Add a new migration for schema or RPC changes; do not rewrite migrations that may already be deployed.
- Update `supabase/tests/food_security.sql` for authorization, RLS, or food RPC behavior changes.
- Copy `.env.example` to `.env` locally. Never commit `.env`, service-role keys, access tokens, or administrator UUIDs.
- Browser code may use only the Supabase publishable key. Privileged scraper operations require server-side service-role credentials.

## Commits and generated files

Use concise Conventional Commit subjects such as `feat(food): ...`, `fix(skinfolio): ...`, `test(app): ...`, and `chore: ...`. Keep commits logically reviewable. Do not commit `dist/`, dependencies, local environment files, or generated scraper output.
