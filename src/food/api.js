import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

export const foodConfigured = Boolean(url && publishableKey);
export const foodClient = foodConfigured
  ? createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const ERROR_MESSAGES = {
  FOOD_NO_ACTIVE_CYCLE: 'No hay ningún pedido abierto esta semana.',
  FOOD_CYCLE_CLOSED: 'El pedido se ha cerrado mientras estabas editando.',
  FOOD_ORDER_NOT_FOUND: 'No hemos podido recuperar ese pedido en este dispositivo.',
  FOOD_FORBIDDEN: 'Tu cuenta no tiene permiso para administrar pedidos.',
  FOOD_OPEN_CYCLE_EXISTS: 'Ya hay un pedido semanal abierto.',
  FOOD_INVALID_ITEMS: 'Algún plato ya no está disponible. Revisa el pedido.',
  FOOD_INVALID_INPUT: 'Revisa los datos del pedido e inténtalo de nuevo.',
};

export class FoodApiError extends Error {
  constructor(code, message, cause) {
    super(message);
    this.name = 'FoodApiError';
    this.code = code;
    this.cause = cause;
  }
}

function errorCode(error) {
  const text = `${error?.message ?? ''} ${error?.details ?? ''}`;
  return Object.keys(ERROR_MESSAGES).find((code) => text.includes(code)) ?? 'FOOD_UNKNOWN';
}

function asFoodError(error) {
  if (error instanceof FoodApiError) return error;
  const code = errorCode(error);
  const fallback = 'No hemos podido conectar con el servicio de pedidos. Inténtalo de nuevo.';
  return new FoodApiError(code, ERROR_MESSAGES[code] ?? fallback, error);
}

async function rpc(name, params) {
  if (!foodClient) throw new FoodApiError('FOOD_NOT_CONFIGURED', 'El servicio de pedidos aún no está configurado.');
  const { data, error } = await foodClient.rpc(name, params);
  if (error) throw asFoodError(error);
  return data;
}

function normalizeItem(item) {
  return {
    id: item.id,
    restaurantId: item.restaurant_id ?? item.restaurantId,
    category: item.category || 'Otros',
    name: item.name,
    description: item.description ?? '',
    priceCents: item.price_cents ?? item.priceCents,
    currency: item.currency ?? 'EUR',
    imageUrl: item.image_url ?? item.imageUrl ?? null,
    available: item.available ?? true,
  };
}

function normalizeRestaurant(restaurant) {
  if (!restaurant) return null;
  return {
    ...restaurant,
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description ?? '',
    imageUrl: restaurant.image_url ?? restaurant.imageUrl ?? null,
    sourceUrl: restaurant.source_url ?? restaurant.sourceUrl ?? null,
    availableItems: restaurant.available_items ?? restaurant.availableItems ?? 0,
    openingHours: restaurant.opening_hours ?? restaurant.openingHours ?? [],
  };
}

function normalizeOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    cycleId: order.cycle_id ?? order.cycleId,
    cycleStatus: order.cycle_status ?? order.cycleStatus,
    displayName: order.display_name ?? order.displayName,
    note: order.note ?? '',
    createdAt: order.created_at ?? order.createdAt,
    updatedAt: order.updated_at ?? order.updatedAt,
    totalCents: order.total_cents ?? order.totalCents ?? 0,
    restaurant: normalizeRestaurant(order.restaurant),
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      menuItemId: item.menu_item_id ?? item.menuItemId,
      name: item.item_name ?? item.name,
      unitPriceCents: item.unit_price_cents ?? item.unitPriceCents,
      quantity: item.quantity,
      note: item.note ?? '',
      lineTotalCents: item.line_total_cents ?? item.lineTotalCents,
    })),
  };
}

export async function getActiveMenu() {
  if (!foodConfigured) return null;
  const data = await rpc('food_active_menu');
  if (!data) return null;
  return {
    cycle: {
      id: data.cycle.id,
      status: data.cycle.status,
      openedAt: data.cycle.opened_at ?? data.cycle.openedAt,
    },
    restaurant: normalizeRestaurant(data.restaurant),
    menuItems: (data.menu_items ?? data.menuItems ?? []).map(normalizeItem),
  };
}

export async function getRestaurantOptions() {
  if (!foodConfigured) return [];
  const data = await rpc('food_restaurant_options');
  return (data ?? []).map(normalizeRestaurant);
}

export async function submitOrder({ cycleId, displayName, note, items }) {
  const data = await rpc('food_submit_order', {
    p_cycle_id: cycleId,
    p_display_name: displayName,
    p_note: note || null,
    p_items: items,
  });
  return { orderId: data.order_id, token: data.edit_token };
}

export async function getOrder(orderId, token) {
  return normalizeOrder(await rpc('food_get_order', { p_order_id: orderId, p_token: token }));
}

export async function updateOrder({ orderId, token, displayName, note, items }) {
  return normalizeOrder(await rpc('food_update_order', {
    p_order_id: orderId,
    p_token: token,
    p_display_name: displayName,
    p_note: note || null,
    p_items: items,
  }));
}

export const foodAuth = {
  async session() {
    if (!foodClient) return null;
    const { data, error } = await foodClient.auth.getSession();
    if (error) throw asFoodError(error);
    return data.session;
  },
  onChange(callback) {
    if (!foodClient) return () => {};
    const { data } = foodClient.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },
  async signIn(email, password) {
    if (!foodClient) throw new FoodApiError('FOOD_NOT_CONFIGURED', 'El servicio de pedidos aún no está configurado.');
    const { data, error } = await foodClient.auth.signInWithPassword({ email, password });
    if (error) throw new FoodApiError('FOOD_AUTH_FAILED', 'El correo o la contraseña no son correctos.', error);
    return data.session;
  },
  async signOut() {
    if (!foodClient) return;
    const { error } = await foodClient.auth.signOut();
    if (error) throw asFoodError(error);
  },
};

export const foodAdminApi = {
  access: () => rpc('food_admin_access'),
  catalog: async () => (await rpc('food_admin_catalog') ?? []).map(normalizeRestaurant),
  current: () => rpc('food_admin_current'),
  history: () => rpc('food_admin_history'),
  openCycle: (restaurantId) => rpc('food_admin_open_cycle', { p_restaurant_id: restaurantId }),
  updateRestaurantHours: async (restaurantId, openingHours) => normalizeRestaurant(await rpc('food_admin_update_restaurant_hours', {
    p_restaurant_id: restaurantId,
    p_opening_hours: openingHours,
  })),
  closeCycle: (cycleId, serviceFeeCents) => rpc('food_admin_close_cycle', {
    p_cycle_id: cycleId,
    p_service_fee_cents: serviceFeeCents,
  }),
};

export { normalizeOrder, normalizeRestaurant, asFoodError };
