import { describe, expect, it } from 'vitest';
import { aggregateItems, cycleAmounts, parseServiceFee } from './admin';

describe('administrator item grouping', () => {
  it('aggregates quantities, totals, and attributed notes', () => {
    const result = aggregateItems([
      {
        id: '1',
        displayName: 'Ana',
        note: '',
        createdAt: '',
        updatedAt: '',
        totalCents: 800,
        items: [
          {
            id: '1',
            menuItemId: 'a',
            name: 'Croquetas',
            quantity: 2,
            unitPriceCents: 400,
            currency: 'EUR',
            note: 'Sin salsa',
          },
        ],
      },
      {
        id: '2',
        displayName: 'Luis',
        note: '',
        createdAt: '',
        updatedAt: '',
        totalCents: 400,
        items: [
          {
            id: '2',
            menuItemId: 'a',
            name: 'Croquetas',
            quantity: 1,
            unitPriceCents: 400,
            currency: 'EUR',
            note: '',
          },
        ],
      },
    ]);
    expect(result).toEqual([
      { name: 'Croquetas', quantity: 3, totalCents: 1200, notes: ['Ana: Sin salsa'] },
    ]);
  });

  it('parses service fees as integer cents and rejects malformed amounts', () => {
    expect(parseServiceFee('2,50')).toBe(250);
    expect(parseServiceFee('12.9')).toBe(1290);
    expect(parseServiceFee('1,234')).toBeNull();
    expect(parseServiceFee('-1')).toBeNull();
  });

  it('keeps service fees separate from order subtotals', () => {
    expect(
      cycleAmounts({
        id: 'cycle-1',
        status: 'open',
        openedAt: '',
        closedAt: null,
        restaurant: {
          id: 'restaurant-1',
          name: 'PSM',
          description: '',
          imageUrl: null,
          sourceUrl: null,
          availableItems: 0,
          openingHours: [],
        },
        subtotalCents: 1200,
        serviceFeeCents: 250,
        totalCents: 1450,
        orders: [],
      }),
    ).toEqual({
      subtotal: 1200,
      fee: 250,
      total: 1450,
    });
  });
});
