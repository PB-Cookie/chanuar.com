# Repository Guidelines

## Architecture and ownership

This is the portfolio for Carlos Alberto Chanuar Martínez (`@chanuar`), built
with Vite, React 19, React Router 7 Data Mode, and strict TypeScript.

- `src/app/` owns startup, routing, metadata, body environments, the portfolio
  home, and the portfolio-styled 404 surface.
- `public/` owns static assets, `robots.txt`, and `sitemap.xml`.
- The only public application route is `/`. Unknown routes must render the
  portfolio-styled 404 and remain `noindex`.
- Keep the portfolio identity in `src/app/Home.tsx`, root metadata, and the
  root `ProfilePage` JSON-LD in sync. Canonical URLs use
  `https://chanuar.com` and omit trailing slashes except for `/`.
- `404.html` and Cloudflare Pages must preserve a real 404 response for
  unknown direct requests.

Skinfolio and MenuBox are standalone projects. New product work belongs in
their repositories: [chanuar/skinfolio](https://github.com/chanuar/skinfolio)
and [chanuar/MenuBox](https://github.com/chanuar/MenuBox).

## Application conventions

- Every route surface needs one `<main id="main-content" tabIndex={-1}>`.
  Preserve the shell skip link and route-change focus restoration.
- Preserve accessibility behavior: semantic controls and landmarks, keyboard
  navigation, visible focus, validation focus, and announced loading or error
  states. Prefer native semantics over ARIA.
- Use React Router `Link` or `NavLink` for internal route navigation. Use
  native anchors for same-page hash targets and external destinations.
- Keep state local to its owning component. Do not add global stores, service
  classes, repositories, dependency injection, barrel files, or speculative
  shared UI.
- Visible portfolio copy is Spanish. Internationalization is deferred until a
  second locale is requested.

## Public route contract

Changes to `/` or the 404 surface require updating the React Router tree,
static HTML entry point and metadata, Vite build inputs, Cloudflare Pages
behavior, route metadata/body-environment configuration, and crawl metadata
where applicable.

## TypeScript and formatting

- Application and test code is TypeScript (`.ts`/`.tsx`); do not add
  `.js`/`.jsx` under `src/`.
- Keep strict typing at trust boundaries. Do not replace validation with `any`
  or unchecked raw objects.
- Use `PascalCase` for React components and component files, `camelCase` for
  functions and variables, and uppercase names for true module-level
  constants.
- Prettier owns formatting. ESLint owns correctness; do not disable rules
  globally to accommodate one file.

## Commands and verification

- `npm ci` installs locked dependencies; use Node 24.21.0 LTS (`.node-version`).
- `npm run dev` starts Vite.
- `npm run lint` runs ESLint with zero warnings allowed.
- `npm run format:check` verifies Prettier formatting.
- `npm run typecheck` runs strict TypeScript checks.
- `npm test` runs Vitest once in jsdom; `npm run test:watch` watches affected
  tests.
- `npm run build` type-checks and builds the portfolio and 404 entry points.

Place Vitest and Testing Library tests beside the code as `*.test.ts` or
`*.test.tsx`. Prefer user-visible behavior and accessibility-oriented queries.
Before handoff, run lint, format check, tests, and build.

Husky runs lint-staged formatting and linting before commits, then type-checks
and runs the full test suite before pushes. Do not bypass these hooks.

## Security and commits

- Copy `.env.example` to `.env` locally. Never commit `.env`, access tokens,
  credentials, or private API keys.
- Use concise Conventional Commit subjects such as `feat(app): ...`,
  `fix(app): ...`, `test(app): ...`, and `chore: ...`.
- Do not commit `dist/`, dependencies, local environment files, or generated
  output.
