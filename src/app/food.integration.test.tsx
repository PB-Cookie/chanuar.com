import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { RouteEnvironment } from './RouteEnvironment';

vi.mock('../products/food/api/foodApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../products/food/api/foodApi')>();
  return {
    ...actual,
    foodConfigured: false,
    getActiveMenu: vi.fn().mockResolvedValue(null),
    getRestaurantOptions: vi.fn().mockResolvedValue([
      {
        id: 'restaurant-1',
        name: 'PSM Burger',
        description: 'Hamburguesas artesanas en Telde.',
        imageUrl: 'https://example.com/psm.jpg',
        sourceUrl: 'https://www.ubereats.com/es/store/psm-burger-telde/example',
        availableItems: 45,
        openingHours: [{ day: 1, periods: [{ open: '12:00', close: '23:30' }] }],
      },
    ]),
    foodAuth: {
      session: vi.fn().mockResolvedValue(null),
      onChange: vi.fn(() => () => {}),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  };
});
import { Component as OrderRoute, loader as orderLoader } from '../products/food/routes/OrderRoute';
import { Component as AdminRoute, loader as adminLoader } from '../products/food/routes/AdminRoute';
import {
  Component as OptionsRoute,
  loader as optionsLoader,
} from '../products/food/routes/OptionsRoute';

function renderRoute(Component: React.ComponentType, loader: () => Promise<unknown>, path: string) {
  const router = createMemoryRouter([{ path, Component, loader }], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

function PageEnvironmentHarness() {
  const router = createMemoryRouter(
    [
      {
        Component: RouteEnvironment,
        children: [{ path: '/food', handle: { page: 'food' }, element: <div>ready</div> }],
      },
    ],
    { initialEntries: ['/food'] },
  );
  return <RouterProvider router={router} />;
}

describe('food route integration without configured Supabase', () => {
  afterEach(() => {
    cleanup();
    document.head
      .querySelectorAll('link[rel="preload"][as="font"]')
      .forEach((node) => node.remove());
    localStorage.clear();
  });

  it('shows the friendly no-active-week state', async () => {
    renderRoute(OrderRoute, orderLoader, '/food');
    expect(
      await screen.findByRole('heading', { name: /No hay ningún pedido abierto/ }),
    ).toBeVisible();
    expect(screen.getByText(/Falta conectar el proyecto de Supabase/)).toBeVisible();
  });

  it('shows the admin sign-in surface without catalog editing controls', async () => {
    renderRoute(AdminRoute, adminLoader, '/food/admin');
    expect(await screen.findByRole('heading', { name: 'Administración' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
    expect(screen.queryByText(/editar restaurante/i)).not.toBeInTheDocument();
  });

  it('lists imported restaurants with descriptions and Uber Eats links', async () => {
    renderRoute(OptionsRoute, optionsLoader, '/food/options');
    expect(await screen.findByRole('heading', { name: 'PSM Burger' })).toBeVisible();
    expect(screen.getByText('Hamburguesas artesanas en Telde.')).toBeVisible();
    expect(screen.getByText('45 platos disponibles')).toBeVisible();
    expect(screen.getByText('Horario')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver en Uber Eats/ })).toHaveAttribute(
      'href',
      'https://www.ubereats.com/es/store/psm-burger-telde/example',
    );
  });

  it('loads restaurant options and an unauthenticated admin session at route boundaries', async () => {
    await expect(optionsLoader()).resolves.toHaveLength(1);
    await expect(adminLoader()).resolves.toMatchObject({
      session: null,
      catalog: [],
      current: null,
      history: [],
    });
  });

  it('applies food metadata and never preloads League fonts on food pages', async () => {
    render(<PageEnvironmentHarness />);
    await waitFor(() => expect(document.body).toHaveClass('food-page'));
    expect(document.title).toBe('Mesa abierta — El pedido de la semana');
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#f7f1e7',
    );
    expect(document.querySelectorAll('link[rel="preload"][as="font"]')).toHaveLength(0);
  });
});
