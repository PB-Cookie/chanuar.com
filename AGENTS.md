# Repository Guidelines

## Project Structure & Module Organization

This is a Vite/React application. `src/` contains the Skinfolio landing page, shared components in `src/components/`, and ordering features in `src/food/`. `src/AppRouter.jsx` handles routes and page metadata. Static assets belong in `public/`; HTML entry points for `/food`, `/food/options`, and `/food/admin` are under `food/`. Supabase changes live in `supabase/migrations/`, with database checks in `supabase/tests/`. Do not commit generated `dist/` output or dependencies.

## Build, Test, and Development Commands

- `npm ci` installs the exact dependency versions from `package-lock.json` (Node 20.19 or newer).
- `npm run dev` starts the Vite development server.
- `npm test` runs the Vitest suite once in jsdom.
- `npm run test:watch` reruns affected tests while developing.
- `npm run build` creates the production bundle and validates configured entry points.
- `npm run preview` serves the production bundle locally for a final smoke test.
- `supabase test db` runs SQL security checks against a disposable local Supabase stack.

## Coding Style & Naming Conventions

Follow existing JavaScript/JSX style: two-space indentation, semicolons, single quotes, trailing commas in multiline structures, and ES modules. Use `PascalCase` for React components and files (`FoodHeader.jsx`), `camelCase` for functions and variables, and uppercase names for module-level constants. Keep food-domain code in `src/food/`. No formatter or linter is configured, so match neighboring code.

## Testing Guidelines

Use Vitest with Testing Library and `@testing-library/jest-dom`. Place tests beside the code they exercise as `*.test.js` or `*.test.jsx`. Prefer user-visible behavior and accessibility-oriented queries. Add regression coverage for fixes; run `npm test` and `npm run build` before submitting. There is no coverage threshold. For migration or authorization changes, also update and run `supabase/tests/food_security.sql`.

## Commit & Pull Request Guidelines

Recent commits follow Conventional Commit-style subjects: `feat(food): add ...`, `fix(food): ...`, `docs(scraper): ...`, and `chore: ...`. Use an imperative, concise subject with an appropriate scope. Pull requests should explain the user-facing change, identify affected routes or migrations, link relevant issues, and report test commands run. Include screenshots for visible UI changes and deployment notes for environment-variable or Supabase changes.

## Security & Configuration

Copy `.env.example` to `.env` for local development. Never commit `.env`, service-role keys, or administrator UUIDs. Browser code may use only the Supabase publishable key; privileged scraper operations require server-side service-role credentials.
