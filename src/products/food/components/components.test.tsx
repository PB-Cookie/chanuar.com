import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import FoodHeader from './FoodHeader';
import { aggregateItems, cycleAmounts, parseServiceFee } from '../model/admin';
import { OpeningHours, OpeningHoursForm, formatOpeningPeriods, normalizeOpeningHours } from './OpeningHours';

afterEach(cleanup);

describe('employee menu controls', () => {
  it('marks nested food navigation with React Router', () => {
    render(<MemoryRouter initialEntries={['/food/options']}><FoodHeader /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Restaurantes' })).toHaveAttribute('aria-current', 'page');
  });

});

describe('restaurant opening hours', () => {
  const openingHours = [
    { day: 1, periods: [{ open: '12:00', close: '16:00' }, { open: '19:00', close: '23:30' }] },
    { day: 2, periods: [{ open: '12:00', close: '23:30' }] },
  ];

  it('normalizes schedules and formats split shifts', () => {
    expect(normalizeOpeningHours([...openingHours, { day: 9, periods: [] }])).toEqual(openingHours);
    expect(formatOpeningPeriods(openingHours[0]!.periods)).toBe('12:00–16:00, 19:00–23:30');
    expect(formatOpeningPeriods([])).toBe('Cerrado');
  });

  it('shows a full, labelled weekly schedule', async () => {
    const user = userEvent.setup();
    render(<OpeningHours openingHours={openingHours} />);
    await user.click(screen.getByText('Horario'));
    expect(screen.getByText('Lunes')).toBeVisible();
    expect(screen.getAllByText('Cerrado')).toHaveLength(5);
  });

  it('lets an administrator enable a day and save structured hours', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<OpeningHoursForm restaurant={{ id: 'restaurant-1', openingHours: [] }} onSave={onSave} />);
    await user.click(screen.getByRole('checkbox', { name: 'Lunes' }));
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }));
    expect(onSave).toHaveBeenCalledWith('restaurant-1', [
      { day: 1, periods: [{ open: '12:00', close: '23:00' }] },
    ]);
  });
});

describe('administrator item grouping', () => {
  it('aggregates quantities, totals, and attributed notes', () => {
    const result = aggregateItems([
      { id: '1', displayName: 'Ana', note: '', createdAt: '', updatedAt: '', totalCents: 800, items: [{ id: '1', menuItemId: 'a', name: 'Croquetas', quantity: 2, unitPriceCents: 400, currency: 'EUR', note: 'Sin salsa' }] },
      { id: '2', displayName: 'Luis', note: '', createdAt: '', updatedAt: '', totalCents: 400, items: [{ id: '2', menuItemId: 'a', name: 'Croquetas', quantity: 1, unitPriceCents: 400, currency: 'EUR', note: '' }] },
    ]);
    expect(result).toEqual([{ name: 'Croquetas', quantity: 3, totalCents: 1200, notes: ['Ana: Sin salsa'] }]);
  });

  it('parses service fees as integer cents and rejects malformed amounts', () => {
    expect(parseServiceFee('2,50')).toBe(250);
    expect(parseServiceFee('12.9')).toBe(1290);
    expect(parseServiceFee('1,234')).toBeNull();
    expect(parseServiceFee('-1')).toBeNull();
  });

  it('keeps service fees separate from order subtotals', () => {
    expect(cycleAmounts({
      id: 'cycle-1', status: 'open', openedAt: '', closedAt: null,
      restaurant: { id: 'restaurant-1', name: 'PSM', description: '', imageUrl: null, sourceUrl: null, availableItems: 0, openingHours: [] },
      subtotalCents: 1200, serviceFeeCents: 250, totalCents: 1450, orders: [],
    })).toEqual({
      subtotal: 1200, fee: 250, total: 1450,
    });
  });
});
