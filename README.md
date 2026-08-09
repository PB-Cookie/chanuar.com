# chanuar.com

The existing Skinfolio remains at `/`. The weekly food-ordering application is available at `/food`, with administration at `/food/admin`.

## Local development

Copy `.env.example` to `.env`, add the existing Supabase project URL and publishable key, then run `npm run dev`. Apply the migration in `supabase/migrations` before testing real orders.

Useful checks:

```text
npm test
npm run build
```

The Cloudflare Pages fallback in `public/_redirects` allows direct loads and refreshes for both food routes.
