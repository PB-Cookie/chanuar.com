import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, matchRoutes, RouterProvider } from 'react-router';
import { routes } from './router';
import { RouteEnvironment, type Page } from './RouteEnvironment';
import { RouteError } from './RouteError';
import spanishEntry from '../../index.html?raw';
import englishEntry from '../../en.html?raw';
import notFoundEntry from '../../404.html?raw';

afterEach(() => vi.restoreAllMocks());

describe('application router', () => {
  it.each([
    ['/', 'home', spanishEntry],
    ['/en', 'home', englishEntry],
    ['/missing', 'notFound', notFoundEntry],
  ] as const)('keeps HTML and client metadata consistent at %s', (path, page, html) => {
    const entry = new DOMParser().parseFromString(html, 'text/html');
    const router = createMemoryRouter(
      [
        {
          Component: RouteEnvironment,
          children: [{ path, handle: page satisfies Page, element: <div>ready</div> }],
        },
      ],
      { initialEntries: [path] },
    );
    render(<RouterProvider router={router} />);

    expect(document.title).toBe(entry.title);
    for (const tag of entry.querySelectorAll('meta[name], meta[property], link[rel="canonical"]')) {
      const attribute = tag.hasAttribute('name')
        ? 'name'
        : tag.hasAttribute('property')
          ? 'property'
          : 'rel';
      if (tag.getAttribute('name') === 'viewport') continue;
      const selector = `${tag.localName}[${attribute}="${tag.getAttribute(attribute)}"]`;
      expect(document.querySelector(selector)).toHaveAttribute(
        tag.localName === 'link' ? 'href' : 'content',
        tag.getAttribute(tag.localName === 'link' ? 'href' : 'content'),
      );
    }
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `https://chanuar.com/${page === 'home' ? 'portfolio-og.png' : 'favicon.svg'}`,
    );
  });

  it.each(['/', '/en'])('matches the portfolio URL %s', (path) => {
    const matches = matchRoutes(routes, path);
    expect(matches).toBeTruthy();
    expect(matches?.some((match) => match.route.path === '*')).toBe(false);
  });

  it('uses the catch-all route for direct unknown loads', () => {
    for (const path of ['/missing', '/skinfolio', '/food', '/food/options', '/food/admin']) {
      expect(matchRoutes(routes, path)?.at(-1)?.route.path).toBe('*');
    }
  });

  it('shows a safe fallback when a route fails to render', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function BrokenRoute(): never {
      throw new Error('private error details');
    }
    const router = createMemoryRouter([
      { path: '/', Component: BrokenRoute, ErrorBoundary: RouteError },
    ]);

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Algo salió mal.' })).toBeVisible();
    expect(screen.queryByText('private error details')).not.toBeInTheDocument();
  });

  it.each([
    ['home', '/', 'Carlos Chanuar | Software Developer', '#08090b', '/', 'es_ES'],
    ['home', '/en', 'Carlos Chanuar | Software Developer', '#08090b', '/en', 'en_US'],
    ['notFound', '/missing', 'Página no encontrada - chanuar.com', '#08090b', null, 'es_ES'],
  ] as const)(
    'applies %s metadata at %s',
    async (page, path, title, theme, canonicalPath, locale) => {
      const router = createMemoryRouter(
        [
          {
            Component: RouteEnvironment,
            children: [{ path, handle: page satisfies Page, element: <div>ready</div> }],
          },
        ],
        { initialEntries: [path] },
      );
      render(<RouterProvider router={router} />);
      await waitFor(() => expect(document.title).toBe(title));
      expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', theme);
      expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute(
        'content',
        locale,
      );
      expect(document.querySelectorAll('link[rel="preload"][as="font"]')).toHaveLength(0);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonicalPath) {
        expect(canonical).toHaveAttribute('href', `https://chanuar.com${canonicalPath}`);
      } else {
        expect(canonical).not.toBeInTheDocument();
      }
      if (page === 'notFound')
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
          'content',
          'noindex, nofollow',
        );
    },
  );

  it('moves focus to the main content after client-side navigation', async () => {
    const router = createMemoryRouter([
      {
        Component: RouteEnvironment,
        children: [
          {
            index: true,
            handle: 'home' satisfies Page,
            element: (
              <main id="main-content" tabIndex={-1}>
                <Link to="/next">Siguiente página</Link>
              </main>
            ),
          },
          {
            path: 'next',
            handle: 'home' satisfies Page,
            element: (
              <main id="main-content" tabIndex={-1}>
                <h1>Siguiente página</h1>
              </main>
            ),
          },
        ],
      },
    ]);
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByRole('link', { name: 'Siguiente página' }));

    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus());
  });
});
