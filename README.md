# chanuar.com 👋

This is my portfolio — the place where I share what I build, how I approach software, and the kind of problems I enjoy solving.

I'm a full-stack developer who enjoys building different and interesting things, exploring new technologies n ideas and learning along the way. The website is currently available in Spanish (working on it!).

## ✨ What's inside

- A bit about me, what I'm working on, and my technical background.
- Some of the products I've built, including their goals, architecture, and tech stack.
- A contact form powered by EmailJS, with direct email as a fallback.
- Canonical metadata, social previews, a sitemap, and structured data.

## 🚀 Projects

| Project       | What is it?                                                              | Repository                                                |
| ------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Skinfolio** | A League of Legends cosmetic collection and progression dashboard.       | [chanuar/skinfolio](https://github.com/chanuar/skinfolio) |
| **MenuBox**   | A weekly team-ordering application with public and administrative flows. | [chanuar/MenuBox](https://github.com/chanuar/MenuBox)     |

Skinfolio and MenuBox now live in their own repositories and are developed and versioned independently.

This repository is just for **chanuar.com**.

## 🚧 Repository status

I'm still working on it, translating everything and adding more content. Also want to try using gsap/three.js for some animations and transitions.

## 🛠️ Tech stack

- React 19
- React Router 7
- TypeScript
- Vite
- EmailJS
- Vitest
- Testing Library
- ESLint
- Prettier
- Husky
- lint-staged

## 💻 Running it locally

### Requirements

- Node.js 20.19 or newer
- Node 22 is the repository default
- npm

Clone the repository and install the dependencies:

```bash
git clone https://github.com/chanuar/chanuar.com.git
cd chanuar.com
npm ci
```

Copy `.env.example` to `.env` and add the browser-safe EmailJS values if you want the contact form to work:

```dotenv
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=...
```

The temporary legacy product routes also use these Supabase values:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Keep secrets out of `.env`.

That means no service-role credentials, database passwords, access tokens, or administrator identifiers.

Then start the development server:

```bash
npm run dev
```

## 🧪 Scripts

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the Vite development server.                    |
| `npm run build`        | Type-check the project and create a production build. |
| `npm run preview`      | Preview the production build locally.                 |
| `npm run lint`         | Run ESLint with zero warnings allowed.                |
| `npm run format`       | Format supported files with Prettier.                 |
| `npm run format:check` | Check formatting without changing files.              |
| `npm run typecheck`    | Run strict TypeScript checks.                         |
| `npm test`             | Run the Vitest suite once.                            |
| `npm run test:watch`   | Run Vitest in watch mode.                             |

Git hooks also run lint-staged checks before commits and the type-check and test suite before pushes.

## 📁 Structure

```text
src/
├── app/                  # Portfolio shell, routing, metadata, pages, and 404 UI
└── test/                 # Shared test setup

public/                   # Assets, robots.txt, sitemap.xml, and route rewrites
```

The portfolio itself lives in `src/app/`.

Product code is intentionally kept separate: it shouldn't import from the portfolio application or from another product.

## 📬 Say hi

If you want to talk about a project, software, League of Legends, or just say hello:

- [carlos@chanuar.com](mailto:carlos@chanuar.com)
- [GitHub — @chanuar](https://github.com/chanuar)
- [LinkedIn — Carlos Chanuar Martínez](https://www.linkedin.com/in/carlos-chanuar/)
