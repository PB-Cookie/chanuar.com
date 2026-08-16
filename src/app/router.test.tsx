import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, matchRoutes, RouterProvider } from 'react-router';
import { routes } from './router';
import { RouteEnvironment, type Page } from './RouteEnvironment';

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('link[rel="preload"][as="font"]').forEach((node) => node.remove());
});

describe('application router', () => {
  it('matches the portfolio URL', () => {
    const matches = matchRoutes(routes, '/');
    expect(matches).toBeTruthy();
    expect(matches?.some((match) => match.route.path === '*')).toBe(false);
  });

  it('uses the catch-all route for direct unknown loads', () => {
    for (const path of ['/missing', '/skinfolio', '/food', '/food/options', '/food/admin']) {
      expect(matchRoutes(routes, path)?.at(-1)?.route.path).toBe('*');
    }
  });

  it.each([
    ['home', '/', 'Carlos Chanuar — Desarrollador full stack', 'portfolio-page', '#08090b', '/'],
    [
      'notFound',
      '/missing',
      'Página no encontrada — chanuar.com',
      'portfolio-page',
      '#08090b',
      null,
    ],
  ] as const)(
    'applies %s metadata and body environment',
    async (page, path, title, bodyClass, theme, canonicalPath) => {
      const router = createMemoryRouter(
        [
          {
            Component: RouteEnvironment,
            children: [{ path, handle: { page: page satisfies Page }, element: <div>ready</div> }],
          },
        ],
        { initialEntries: [path] },
      );
      render(<RouterProvider router={router} />);
      await waitFor(() => expect(document.title).toBe(title));
      expect(document.body).toHaveClass(bodyClass);
      expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', theme);
      expect(document.querySelectorAll('link[rel="preload"][as="font"]')).toHaveLength(0);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonicalPath) {
        expect(canonical).toHaveAttribute('href', `http://localhost:3000${canonicalPath}`);
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
            handle: { page: 'home' satisfies Page },
            element: (
              <main id="main-content" tabIndex={-1}>
                <Link to="/next">Siguiente página</Link>
              </main>
            ),
          },
          {
            path: 'next',
            handle: { page: 'home' satisfies Page },
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
