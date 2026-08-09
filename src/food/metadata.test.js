// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readEntry(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('food route entry metadata', () => {
  it('ships employee metadata in the initial HTML', () => {
    const html = readEntry('food/index.html');
    expect(html).toContain('<title>Mesa abierta — Pedido semanal</title>');
    expect(html).toContain('property="og:image" content="https://chanuar.com/food-og.png"');
    expect(html).not.toContain('Skinfolio');
  });

  it('ships private admin metadata in the initial HTML', () => {
    const html = readEntry('food/admin/index.html');
    expect(html).toContain('<title>Administración — Mesa abierta</title>');
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).not.toContain('Skinfolio');
  });

  it('ships restaurant-directory metadata in the initial HTML', () => {
    const html = readEntry('food/options/index.html');
    expect(html).toContain('<title>Restaurantes — Mesa abierta</title>');
    expect(html).toContain('property="og:image" content="https://chanuar.com/food-og.png"');
    expect(html).not.toContain('Skinfolio');
  });
});
