import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, matchRoutes, RouterProvider } from 'react-router';
import { routes } from './router';
import { RouteEnvironment, type Page } from './RouteEnvironment';
import { RouteError } from './RouteError';

afterEach(() => vi.restoreAllMocks());

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
    ['home', '/', 'Carlos Chanuar — Desarrollador full stack', '#08090b', '/'],
    ['notFound', '/missing', 'Página no encontrada — chanuar.com', '#08090b', null],
  ] as const)('applies %s metadata', async (page, path, title, theme, canonicalPath) => {
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
  });

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
