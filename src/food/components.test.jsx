import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MenuItemCard } from './FoodApp.jsx';
import { aggregateItems } from './AdminApp.jsx';

const item = { id: 'dish-1', category: 'Entrantes', name: 'Croquetas', description: 'Cremosas', priceCents: 850, currency: 'EUR' };

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
    expect(container.querySelector('.food-menu-card__image--placeholder')).toHaveTextContent('E');
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
});
