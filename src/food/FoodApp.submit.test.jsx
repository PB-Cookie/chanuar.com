import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  getActiveMenu: vi.fn(),
  getOrder: vi.fn(),
  submitOrder: vi.fn(),
  updateOrder: vi.fn(),
}));

vi.mock('./api.js', async (importOriginal) => ({
  ...(await importOriginal()),
  foodConfigured: true,
  ...apiMocks,
}));

import FoodApp from './FoodApp.jsx';
import { saveCredential } from './storage.js';

const menu = {
  cycle: { id: 'cycle-1', status: 'open', openedAt: '2026-08-09T12:00:00Z' },
  restaurant: {
    id: 'restaurant-1',
    name: 'La Cocina',
    description: '',
    imageUrl: null,
    sourceUrl: 'https://www.ubereats.com/es/store/la-cocina/example',
  },
  menuItems: [{
    id: 'dish-1', restaurantId: 'restaurant-1', category: 'Platos', name: 'Tortilla',
    description: '', priceCents: 700, currency: 'EUR', imageUrl: null, available: true,
  }],
};

const confirmedOrder = {
  id: 'order-1', cycleId: 'cycle-1', cycleStatus: 'open', displayName: 'Ana', note: '',
  createdAt: '2026-08-09T12:00:00Z', updatedAt: '2026-08-09T12:01:00Z', totalCents: 700,
  items: [{ id: 'line-1', menuItemId: 'dish-1', name: 'Tortilla', unitPriceCents: 700, quantity: 1, note: '', lineTotalCents: 700 }],
};

describe('successful order recovery', () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    apiMocks.getActiveMenu.mockResolvedValue(menu);
    apiMocks.submitOrder.mockResolvedValue({ orderId: 'order-1', token: 'token-1' });
    apiMocks.updateOrder.mockResolvedValue(confirmedOrder);
  });

  it('updates the committed order instead of creating a duplicate when confirmation fails', async () => {
    const user = userEvent.setup();
    apiMocks.getOrder.mockRejectedValueOnce(new Error('confirmation unavailable'));
    render(<FoodApp />);

    await screen.findByRole('heading', { name: 'La Cocina' });
    expect(screen.getByRole('link', { name: /Ver en Uber Eats/ })).toHaveAttribute(
      'href',
      menu.restaurant.sourceUrl,
    );
    expect(screen.getByRole('link', { name: 'Restaurantes' })).toHaveAttribute('href', '/food/options');
    await user.click(screen.getByRole('button', { name: /Añadir una unidad de Tortilla/ }));
    await user.type(screen.getByPlaceholderText(/Cómo te reconocerá/), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }));

    expect(await screen.findByText(/El pedido se ha guardado, pero no pudimos cargar la confirmación/)).toBeVisible();
    expect(apiMocks.submitOrder).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('food:last-order')).toContain('order-1');

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByRole('heading', { name: 'Todo listo, Ana' })).toBeVisible();
    expect(apiMocks.submitOrder).toHaveBeenCalledTimes(1);
    expect(apiMocks.updateOrder).toHaveBeenCalledTimes(1);
  });

  it('removes unavailable resumed items before sending an edit', async () => {
    const user = userEvent.setup();
    saveCredential({ cycleId: 'cycle-1', orderId: 'order-1', token: 'token-1' });
    apiMocks.getOrder.mockResolvedValueOnce({
      ...confirmedOrder,
      totalCents: 1500,
      items: [
        confirmedOrder.items[0],
        { id: 'line-2', menuItemId: 'dish-gone', name: 'Croquetas', unitPriceCents: 400, quantity: 2, note: '', lineTotalCents: 800 },
      ],
    });
    render(<FoodApp />);

    await screen.findByRole('heading', { name: 'Todo listo, Ana' });
    await user.click(screen.getByRole('button', { name: 'Editar pedido' }));
    expect(screen.getByText(/Croquetas ya no está disponible y se quitará/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(apiMocks.updateOrder).toHaveBeenCalledTimes(1));
    expect(apiMocks.updateOrder.mock.calls[0][0].items).toEqual([
      { menu_item_id: 'dish-1', quantity: 1, note: null },
    ]);
  });
});
