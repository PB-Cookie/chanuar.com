# chanuar.com

The personal portfolio of Carlos Alberto Chanuar Martínez, a full-stack
developer focused on accessible interfaces, reliable application architecture,
and practical products. The website interface is currently available in
Spanish.

## Features

- Introduces my background, current focus, and technical experience.
- Presents product case studies with their goals, architecture, and technology.
- Provides an accessible, responsive interface with keyboard navigation,
  reduced-motion support, and a dedicated 404 page.
- Includes a contact form powered by EmailJS with a direct-email fallback.
- Publishes canonical metadata, social previews, a sitemap, and structured data
  for the portfolio identity.

## Projects

| Project   | Description                                                              | Repository                                                |
| --------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| Skinfolio | A League of Legends cosmetic collection and progression dashboard.       | [chanuar/skinfolio](https://github.com/chanuar/skinfolio) |
| MenuBox   | A weekly team-ordering application with public and administrative flows. | [chanuar/MenuBox](https://github.com/chanuar/MenuBox)     |

Skinfolio and MenuBox are developed and versioned independently. This
repository remains the canonical source for the portfolio.

## Repository status

The repository still contains temporary legacy copies of Skinfolio and MenuBox
under `src/products/` while their old portfolio routes remain available during
the production migration. New product work belongs in the standalone
repositories linked above. The legacy copies will be removed after the new
domains and permanent redirects complete their acceptance checks.

## Tech stack

- React 19
- React Router 7
- TypeScript
- Vite
- EmailJS
- Vitest and Testing Library
- ESLint, Prettier, Husky, and lint-staged

## Getting started

### Requirements

- Node.js 20.19 or newer. Node 22 is the repository default.
- npm

### Setup

```bash
git clone https://github.com/chanuar/chanuar.com.git
cd chanuar.com
npm ci
```

Copy `.env.example` to `.env` and provide the browser-safe EmailJS values to
enable the contact form:

```dotenv
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=...
```

The temporary legacy product routes additionally read these Supabase values:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Never add service-role credentials, database passwords, access tokens, or
administrator identifiers to `.env`.

Start the development server:

```bash
npm run dev
```

## Available scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the Vite development server.        |
| `npm run build`        | Type-check and create a production build. |
| `npm run preview`      | Preview the production build locally.     |
| `npm run lint`         | Run ESLint with zero warnings allowed.    |
| `npm run format`       | Format supported files with Prettier.     |
| `npm run format:check` | Check formatting without changing files.  |
| `npm run typecheck`    | Run strict TypeScript checks.             |
| `npm test`             | Run the Vitest suite once.                |
| `npm run test:watch`   | Run Vitest in watch mode.                 |

## Project structure

```text
src/
├── app/                  # Portfolio, application shell, routing, metadata, and 404 UI
├── products/             # Temporary legacy product copies pending final migration cleanup
├── shared/               # Concrete configuration shared by the legacy product routes
└── test/                 # Shared test setup
public/                   # Portfolio assets, robots.txt, sitemap.xml, and route rewrites
```

The portfolio shell and styles live in `src/app/`. Product code must not import
from the portfolio application or from another product.

## Contributing

Before opening a pull request, run:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

Git hooks run lint-staged checks before commits and the type-check and test
suite before pushes.

## Contact

- Email: [carlos@chanuar.com](mailto:carlos@chanuar.com)
- GitHub: [@chanuar](https://github.com/chanuar)
- LinkedIn: [Carlos Chanuar Martínez](https://www.linkedin.com/in/carlos-chanuar-mart%C3%ADnez-591653251/)
