import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, matchRoutes, RouterProvider } from 'react-router';
import { routes } from './router';
import { RouteEnvironment, type Page } from './RouteEnvironment';
import { ErrorBoundary as FoodErrorBoundary } from '../products/food/routes/FoodLayout';

afterEach(cleanup);

describe('application router', () => {
  it.each(['/', '/skinfolio', '/food', '/food/options', '/food/admin'])(
    'matches the public URL %s',
    (path) => {
      const matches = matchRoutes(routes, path);
      expect(matches).toBeTruthy();
      expect(matches?.some((match) => match.route.path === '*')).toBe(false);
    },
  );

  it('nests food pages beneath the shared food route', () => {
    expect(matchRoutes(routes, '/food/options')?.map((match) => match.route.path)).toEqual([
      undefined,
      'food',
      'options',
    ]);
  });

  it('uses the catch-all route for direct unknown loads', () => {
    expect(matchRoutes(routes, '/missing')?.at(-1)?.route.path).toBe('*');
  });

  it.each([
    ['home', '/', 'Carlos Chanuar — Desarrollador full stack', 'portfolio-page', '/'],
    ['skinfolio', '/skinfolio', 'Skinfolio — Colección de skins', 'skinfolio-page', '/skinfolio'],
    ['food', '/food', 'Mesa abierta — El pedido de la semana', 'food-page', '/food'],
    ['options', '/food/options', 'Restaurantes — Mesa abierta', 'food-page', '/food/options'],
    ['admin', '/food/admin', 'Administración — Mesa abierta', 'food-page', null],
    ['notFound', '/missing', 'Página no encontrada — chanuar.com', 'portfolio-page', null],
  ] as const)(
    'applies %s metadata and body environment',
    async (page, path, title, bodyClass, canonicalPath) => {
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
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonicalPath) {
        expect(canonical).toHaveAttribute('href', `http://localhost:3000${canonicalPath}`);
      } else {
        expect(canonical).not.toBeInTheDocument();
      }
      if (page === 'admin' || page === 'notFound')
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
          'content',
          'noindex, nofollow',
        );
    },
  );

  it('announces loader failures and retries them', async () => {
    let attempts = 0;
    const router = createMemoryRouter([
      {
        path: '/',
        loader: () => {
          attempts += 1;
          throw new Error('fallo de red');
        },
        element: <div />,
        ErrorBoundary: FoodErrorBoundary,
      },
    ]);
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('fallo de red');
    await userEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }));
    await waitFor(() => expect(attempts).toBeGreaterThan(1));
  });

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
