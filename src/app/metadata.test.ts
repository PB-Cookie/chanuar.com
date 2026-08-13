// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readEntry(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('route entry metadata', () => {
  it('ships portfolio metadata at the root', () => {
    const html = readEntry('index.html');
    expect(html).toContain('<title>Carlos Chanuar — Desarrollador full stack</title>');
    expect(html).toContain('<body class="portfolio-page">');
    expect(html).toContain('<link rel="canonical" href="https://chanuar.com/" />');
    expect(html).not.toContain('<title>Skinfolio');

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(JSON.parse(jsonLd ?? '')).toMatchObject({
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Carlos Alberto Chanuar Martínez',
        alternateName: '@chanuar',
      },
    });
  });

  it('ships Skinfolio metadata at its direct entry', () => {
    const html = readEntry('skinfolio/index.html');
    expect(html).toContain('<title>Skinfolio — Colección de skins</title>');
    expect(html).toContain('<body class="skinfolio-page">');
    expect(html).toContain('<link rel="canonical" href="https://chanuar.com/skinfolio" />');
  });

  it('ships a noindex portfolio-styled direct 404', () => {
    const html = readEntry('404.html');
    expect(html).toContain('<title>Página no encontrada — chanuar.com</title>');
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).toContain('<body class="portfolio-page">');
  });

  it('rewrites known SPA entries without hiding unknown requests', () => {
    const redirects = readEntry('public/_redirects');
    expect(redirects).toContain('/skinfolio /skinfolio/index.html 200');
    expect(redirects).not.toContain('/* /index.html 200');
  });

  it('ships employee metadata in the initial HTML', () => {
    const html = readEntry('food/index.html');
    expect(html).toContain('<title>MenuBox — El pedido de la semana</title>');
    expect(html).toContain('property="og:image" content="https://chanuar.com/food-og.png"');
    expect(html).not.toContain('Skinfolio');
  });

  it('ships private admin metadata in the initial HTML', () => {
    const html = readEntry('food/admin/index.html');
    expect(html).toContain('<title>Administración — MenuBox</title>');
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).not.toContain('Skinfolio');
  });

  it('ships restaurant-directory metadata in the initial HTML', () => {
    const html = readEntry('food/options/index.html');
    expect(html).toContain('<title>Restaurantes — MenuBox</title>');
    expect(html).toContain('property="og:image" content="https://chanuar.com/food-og.png"');
    expect(html).not.toContain('Skinfolio');
  });

  it('advertises the public sitemap without indexing private administration', () => {
    expect(readEntry('public/robots.txt')).toContain('Sitemap: https://chanuar.com/sitemap.xml');
    const sitemap = readEntry('public/sitemap.xml');
    expect(sitemap).toContain('<loc>https://chanuar.com/skinfolio</loc>');
    expect(sitemap).not.toContain('/food/admin');
  });
});
