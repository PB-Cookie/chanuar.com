import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, matchRoutes, RouterProvider } from 'react-router';
import { routes } from './router';
import { RouteEnvironment, type Page } from './RouteEnvironment';
import { ErrorBoundary as FoodErrorBoundary } from '../products/food/routes/FoodLayout';

afterEach(cleanup);

describe('application router', () => {
  it.each(['/', '/food', '/food/options', '/food/admin'])('matches the public URL %s', (path) => {
    const matches = matchRoutes(routes, path);
    expect(matches).toBeTruthy();
    expect(matches?.some((match) => match.route.path === '*')).toBe(false);
  });

  it('nests food pages beneath the shared food route', () => {
    expect(matchRoutes(routes, '/food/options')?.map((match) => match.route.path)).toEqual([undefined, 'food', 'options']);
  });

  it('uses the catch-all route for direct unknown loads', () => {
    expect(matchRoutes(routes, '/missing')?.at(-1)?.route.path).toBe('*');
  });

  it.each([
    ['skinfolio', '/', 'Skinfolio — Colección de skins', 'skinfolio-page'],
    ['food', '/food', 'Mesa abierta — El pedido de la semana', 'food-page'],
    ['options', '/food/options', 'Restaurantes — Mesa abierta', 'food-page'],
    ['admin', '/food/admin', 'Administración — Mesa abierta', 'food-page'],
  ] as const)('applies %s metadata and body environment', async (page, path, title, bodyClass) => {
    const router = createMemoryRouter([{
      Component: RouteEnvironment,
      children: [{ path, handle: { page: page satisfies Page }, element: <div>ready</div> }],
    }], { initialEntries: [path] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(document.title).toBe(title));
    expect(document.body).toHaveClass(bodyClass);
    if (page === 'admin') expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });

  it('announces loader failures and retries them', async () => {
    let attempts = 0;
    const router = createMemoryRouter([{
      path: '/',
      loader: () => { attempts += 1; throw new Error('fallo de red'); },
      element: <div />,
      ErrorBoundary: FoodErrorBoundary,
    }]);
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('fallo de red');
    await userEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }));
    await waitFor(() => expect(attempts).toBeGreaterThan(1));
  });
});
