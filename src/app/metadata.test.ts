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
    expect(html).toContain('<title>Carlos Chanuar | Software Developer</title>');
    expect(html).toContain('<body class="portfolio-page">');
    expect(html).toContain('<link rel="canonical" href="https://chanuar.com/" />');
    expect(html).toContain('hreflang="en" href="https://chanuar.com/en"');
    expect(html).toContain('property="og:image" content="https://chanuar.com/portfolio-og.png"');
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

  it('ships English metadata for the English URL', () => {
    const html = readEntry('en.html');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Carlos Chanuar | Software Developer</title>');
    expect(html).toContain('<link rel="canonical" href="https://chanuar.com/en" />');
    expect(html).toContain('property="og:locale" content="en_US"');
    expect(html).toContain('hreflang="es" href="https://chanuar.com/"');
    expect(html).toContain('hreflang="en" href="https://chanuar.com/en"');

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(JSON.parse(jsonLd ?? '')).toMatchObject({
      '@type': 'ProfilePage',
      url: 'https://chanuar.com/en',
      mainEntity: { '@type': 'Person', jobTitle: 'Full-stack developer' },
    });
  });

  it('ships a noindex portfolio-styled direct 404', () => {
    const html = readEntry('404.html');
    expect(html).toContain('<title>Página no encontrada - chanuar.com</title>');
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).toContain('<body class="portfolio-page">');
  });

  it('advertises the portfolio sitemap', () => {
    expect(readEntry('public/robots.txt')).toContain('Sitemap: https://chanuar.com/sitemap.xml');
    const sitemap = readEntry('public/sitemap.xml');
    expect(sitemap).toContain('<loc>https://chanuar.com/</loc>');
    expect(sitemap).toContain('<loc>https://chanuar.com/en</loc>');
    expect(readEntry('public/_redirects')).toContain('/en/ /en 301');
  });
});
