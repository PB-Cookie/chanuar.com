import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./api.js', async (importOriginal) => {
  const actual = await importOriginal();
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
import FoodApp from './FoodApp.jsx';
import AdminApp from './AdminApp.jsx';
import OptionsApp from './OptionsApp.jsx';
import { usePageEnvironment } from '../AppRouter.jsx';

function PageEnvironmentHarness({ page }) {
  usePageEnvironment(page);
  return <div>ready</div>;
}

describe('food route integration without configured Supabase', () => {
  afterEach(() => {
    cleanup();
    document.head.querySelectorAll('link[data-skinfolio-font]').forEach((node) => node.remove());
    localStorage.clear();
  });

  it('shows the friendly no-active-week state', async () => {
    render(<FoodApp />);
    expect(await screen.findByRole('heading', { name: /No hay ningún pedido abierto/ })).toBeVisible();
    expect(screen.getByText(/Falta conectar el proyecto de Supabase/)).toBeVisible();
  });

  it('shows the admin sign-in surface without catalog editing controls', async () => {
    render(<AdminApp />);
    expect(await screen.findByRole('heading', { name: 'Administración' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
    expect(screen.queryByText(/editar restaurante/i)).not.toBeInTheDocument();
  });

  it('lists imported restaurants with descriptions and Uber Eats links', async () => {
    render(<OptionsApp />);
    expect(await screen.findByRole('heading', { name: 'PSM Burger' })).toBeVisible();
    expect(screen.getByText('Hamburguesas artesanas en Telde.')).toBeVisible();
    expect(screen.getByText('45 platos disponibles')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver en Uber Eats/ })).toHaveAttribute(
      'href',
      'https://www.ubereats.com/es/store/psm-burger-telde/example',
    );
  });

  it('applies food metadata and never preloads League fonts on food pages', async () => {
    render(<PageEnvironmentHarness page="food" />);
    await waitFor(() => expect(document.body).toHaveClass('food-page'));
    expect(document.title).toBe('Mesa abierta — El pedido de la semana');
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', '#f7f1e7');
    expect(document.querySelectorAll('link[data-skinfolio-font]')).toHaveLength(0);
  });
});
