# Standalone food menu scraper

## Goal

Build a separate Python 3.12 CLI in `../food-scrapper` that reads a curated
`restaurants.yaml`, extracts public restaurant menus through provider adapters,
validates a complete normalized catalog, and synchronizes it atomically into the
existing Supabase `food` schema.

The first adapter targets the configured 200 GRAMOS BURGER Telde Uber Eats page.
It must not log in, bypass CAPTCHAs, rotate proxies, or call private APIs. Uber's
Spanish terms prohibit automated extraction, so operation is explicitly at the
operator's discretion and must stop cleanly if access is blocked.

## Implementation

- Use `uv`, Typer, Pydantic, Playwright Chromium, `supabase-py`, pytest, Ruff,
  and mypy.
- Provide `validate-config`, `scrape`, and `sync` commands. `sync` supports
  `--dry-run`, restaurant selection, and an explicit `--allow-large-change`.
- Derive stable keys from provider store and item UUIDs, deduplicate featured
  items, preserve the canonical category, store prices as integer EUR cents,
  and retain source image URLs and provenance metadata.
- Import the displayed base item only. Preserve modifier indicators as metadata
  because the ordering application does not support configurable products.
- Validate the entire snapshot before publishing. Reject zero-item snapshots,
  duplicate IDs, malformed prices, unsupported currency, and item-count drops
  greater than 50% unless explicitly approved.
- Synchronize through a service-role-only Supabase RPC so restaurant/item upserts
  and missing-item deactivation happen in one database transaction.
- Keep `.env`, browser state, logs, screenshots, and generated snapshots out of
  Git. The service-role key is server-side only; the publishable key is not used.

## Verification

- Unit-test price parsing, key extraction, normalization, deduplication,
  completeness checks, configuration, and dry-run diffs with sanitized fixtures.
- Integration-test idempotent RPC synchronization, updates, missing-item
  deactivation, large-change rejection, rollback, and role restrictions against
  local Supabase.
- Run Ruff, mypy, pytest, a read-only live scrape, and a dry-run sync before the
  first conventional commit in the standalone repository.

## Defaults

- Manual CLI execution only; no scheduler or hosted runtime in v1.
- Spanish locale, Canary timezone, and EUR only.
- Versioned YAML restaurant registry and source CDN image URLs.
- No database changes occur after any fetch, parsing, validation, or access-block
  failure.
