# chanuar.com

The portfolio is available at `/`, Skinfolio at `/skinfolio`, the weekly food-ordering application at `/food`, the restaurant directory at `/food/options`, and administration at `/food/admin`.

## Local development

Copy `.env.example` to `.env`, add the existing Supabase project URL and publishable key, then run `npm run dev`. Apply the migration in `supabase/migrations` before testing real orders.

Useful checks:

```text
npm test
npm run build
```

Cloudflare Pages rewrites each application route to its matching static entry point. Unknown direct requests use the root `404.html`, while React Router handles unknown client-side navigation with the same portfolio-styled page.
