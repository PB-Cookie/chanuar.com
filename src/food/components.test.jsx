import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ItemDetailModal, MenuItemCard } from './FoodApp.jsx';
import { aggregateItems, CycleTotals, parseServiceFee } from './AdminApp.jsx';

const item = { id: 'dish-1', category: 'Entrantes', name: 'Croquetas', description: 'Cremosas', priceCents: 850, currency: 'EUR' };

afterEach(cleanup);

describe('employee menu controls', () => {
  it('supports accessible quantity changes and item notes', async () => {
    const user = userEvent.setup();
    const onQuantity = vi.fn();
    render(<MenuItemCard item={item} entry={{ quantity: 1, note: '' }} onQuantity={onQuantity} onNote={() => {}} />);
    await user.click(screen.getByRole('button', { name: /Añadir una unidad/ }));
    expect(onQuantity).toHaveBeenCalledWith('dish-1', 2);
    expect(screen.getByPlaceholderText(/Sin cebolla/)).toHaveAttribute('maxlength', '240');
  });

  it('falls back to the category placeholder when an image cannot load', () => {
    const { container } = render(
      <MenuItemCard
        item={{ ...item, imageUrl: 'https://example.invalid/missing.jpg' }}
        entry={{ quantity: 0, note: '' }}
        onQuantity={() => {}}
        onNote={() => {}}
      />,
    );
    fireEvent.error(container.querySelector('img'));
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.food-item-image--placeholder')).toHaveTextContent('E');
  });

  it('opens item details from the card', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <MenuItemCard
        item={item}
        entry={{ quantity: 0, note: '' }}
        onQuantity={() => {}}
        onNote={() => {}}
        onOpen={onOpen}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Ver detalles' }));
    expect(onOpen).toHaveBeenCalledWith(item, expect.any(Object));
  });

  it('shows the full description in an accessible modal and closes with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const detailedItem = {
      ...item,
      description: 'Una descripción completa que puede ocupar varias líneas sin quedar cortada a mitad.',
      imageUrl: 'https://example.com/croquetas.jpg',
    };
    render(
      <ItemDetailModal
        item={detailedItem}
        entry={{ quantity: 1, note: '' }}
        onQuantity={() => {}}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Croquetas' })).toHaveTextContent(detailedItem.description);
    expect(screen.getByRole('button', { name: 'Cerrar detalles' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('administrator item grouping', () => {
  it('aggregates quantities, totals, and attributed notes', () => {
    const result = aggregateItems([
      { display_name: 'Ana', items: [{ menu_item_id: 'a', item_name: 'Croquetas', quantity: 2, unit_price_cents: 400, note: 'Sin salsa' }] },
      { display_name: 'Luis', items: [{ menu_item_id: 'a', item_name: 'Croquetas', quantity: 1, unit_price_cents: 400 }] },
    ]);
    expect(result).toEqual([{ name: 'Croquetas', quantity: 3, totalCents: 1200, notes: ['Ana: Sin salsa'] }]);
  });

  it('parses service fees as integer cents and rejects malformed amounts', () => {
    expect(parseServiceFee('2,50')).toBe(250);
    expect(parseServiceFee('12.9')).toBe(1290);
    expect(parseServiceFee('1,234')).toBeNull();
    expect(parseServiceFee('-1')).toBeNull();
  });

  it('shows the service fee beside the subtotal without changing order totals', () => {
    const { container } = render(
      <CycleTotals
        cycle={{
          subtotal_cents: 1200,
          service_fee_cents: 250,
          total_cents: 1450,
          orders: [{ id: 'order-1', total_cents: 1200 }],
        }}
      />,
    );
    expect(container).toHaveTextContent('Subtotal de pedidos');
    expect(container).toHaveTextContent(/12,00/);
    expect(container).toHaveTextContent('Gastos de servicio');
    expect(container).toHaveTextContent(/2,50/);
    expect(container).toHaveTextContent(/14,50/);
  });
});
