import { createClient, type Session } from '@supabase/supabase-js';
import { supabaseEnvironment } from '../../../shared/config/supabase';
import type { ActiveMenu, FoodOrder, OpeningDay, OrderItemPayload, Restaurant } from '../model/types';

export const foodConfigured = supabaseEnvironment.configured;
export const foodClient = foodConfigured
  ? createClient(supabaseEnvironment.url, supabaseEnvironment.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const ERROR_MESSAGES: Record<string, string> = {
  FOOD_NO_ACTIVE_CYCLE: 'No hay ningún pedido abierto esta semana.',
  FOOD_CYCLE_CLOSED: 'El pedido se ha cerrado mientras estabas editando.',
  FOOD_ORDER_NOT_FOUND: 'No hemos podido recuperar ese pedido en este dispositivo.',
  FOOD_FORBIDDEN: 'Tu cuenta no tiene permiso para administrar pedidos.',
  FOOD_OPEN_CYCLE_EXISTS: 'Ya hay un pedido semanal abierto.',
  FOOD_INVALID_ITEMS: 'Algún plato ya no está disponible. Revisa el pedido.',
  FOOD_INVALID_INPUT: 'Revisa los datos del pedido e inténtalo de nuevo.',
};

export class FoodApiError extends Error {
  constructor(public code: string, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'FoodApiError';
  }
}

type Raw = Record<string, any>;

function errorCode(error: unknown) {
  const value = error as { message?: string; details?: string };
  const text = `${value?.message ?? ''} ${value?.details ?? ''}`;
  return Object.keys(ERROR_MESSAGES).find((code) => text.includes(code)) ?? 'FOOD_UNKNOWN';
}

export function asFoodError(error: unknown) {
  if (error instanceof FoodApiError) return error;
  const code = errorCode(error);
  return new FoodApiError(code, ERROR_MESSAGES[code] ?? 'No hemos podido conectar con el servicio de pedidos. Inténtalo de nuevo.', error);
}

async function rpc<T>(name: string, params: Record<string, unknown> = {}): Promise<T> {
  if (!foodClient) throw new FoodApiError('FOOD_NOT_CONFIGURED', 'El servicio de pedidos aún no está configurado.');
  const { data, error } = await foodClient.rpc(name, params);
  if (error) throw asFoodError(error);
  return data as T;
}

function normalizeItem(item: Raw) {
  return {
    id: String(item.id), restaurantId: String(item.restaurant_id ?? item.restaurantId), category: item.category || 'Otros',
    name: String(item.name), description: item.description ?? '', priceCents: Number(item.price_cents ?? item.priceCents),
    currency: item.currency ?? 'EUR', imageUrl: item.image_url ?? item.imageUrl ?? null, available: item.available ?? true,
  };
}

export function normalizeRestaurant(restaurant: Raw | null): Restaurant | null {
  if (!restaurant) return null;
  return {
    id: String(restaurant.id), name: String(restaurant.name), description: restaurant.description ?? '',
    imageUrl: restaurant.image_url ?? restaurant.imageUrl ?? null, sourceUrl: restaurant.source_url ?? restaurant.sourceUrl ?? null,
    availableItems: Number(restaurant.available_items ?? restaurant.availableItems ?? 0),
    openingHours: (restaurant.opening_hours ?? restaurant.openingHours ?? []) as OpeningDay[],
  };
}

export function normalizeOrder(order: Raw | null): FoodOrder | null {
  if (!order) return null;
  return {
    id: String(order.id), cycleId: String(order.cycle_id ?? order.cycleId), cycleStatus: String(order.cycle_status ?? order.cycleStatus),
    displayName: String(order.display_name ?? order.displayName), note: order.note ?? '', createdAt: order.created_at ?? order.createdAt,
    updatedAt: order.updated_at ?? order.updatedAt, totalCents: Number(order.total_cents ?? order.totalCents ?? 0),
    restaurant: normalizeRestaurant(order.restaurant),
    items: (order.items ?? []).map((item: Raw) => ({
      id: String(item.id), menuItemId: String(item.menu_item_id ?? item.menuItemId), name: String(item.item_name ?? item.name),
      unitPriceCents: Number(item.unit_price_cents ?? item.unitPriceCents), quantity: Number(item.quantity), note: item.note ?? '',
      lineTotalCents: Number(item.line_total_cents ?? item.lineTotalCents),
    })),
  };
}

export async function getActiveMenu(): Promise<ActiveMenu | null> {
  if (!foodConfigured) return null;
  const data = await rpc<Raw | null>('food_active_menu');
  if (!data) return null;
  const restaurant = normalizeRestaurant(data.restaurant);
  if (!restaurant) throw new FoodApiError('FOOD_INVALID_RESPONSE', 'El restaurante activo no es válido.');
  return { cycle: { id: String(data.cycle.id), status: String(data.cycle.status), openedAt: data.cycle.opened_at ?? data.cycle.openedAt }, restaurant, menuItems: (data.menu_items ?? data.menuItems ?? []).map(normalizeItem) };
}

export async function getRestaurantOptions(): Promise<Restaurant[]> {
  if (!foodConfigured) return [];
  return (await rpc<Raw[]>('food_restaurant_options') ?? []).map(normalizeRestaurant).filter((item): item is Restaurant => item !== null);
}

export async function submitOrder(input: { cycleId: string; displayName: string; note: string; items: OrderItemPayload[] }) {
  const data = await rpc<Raw>('food_submit_order', { p_cycle_id: input.cycleId, p_display_name: input.displayName, p_note: input.note || null, p_items: input.items });
  return { orderId: String(data.order_id), token: String(data.edit_token) };
}

export async function getOrder(orderId: string, token: string) {
  return normalizeOrder(await rpc<Raw | null>('food_get_order', { p_order_id: orderId, p_token: token }));
}

export async function updateOrder(input: { orderId: string; token: string; displayName: string; note: string; items: OrderItemPayload[] }) {
  return normalizeOrder(await rpc<Raw | null>('food_update_order', { p_order_id: input.orderId, p_token: input.token, p_display_name: input.displayName, p_note: input.note || null, p_items: input.items }));
}

export const foodAuth = {
  async session(): Promise<Session | null> {
    if (!foodClient) return null;
    const { data, error } = await foodClient.auth.getSession();
    if (error) throw asFoodError(error);
    return data.session;
  },
  onChange(callback: (session: Session | null) => void) {
    if (!foodClient) return () => {};
    const { data } = foodClient.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },
  async signIn(email: string, password: string) {
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
  access: () => rpc<boolean>('food_admin_access'),
  catalog: () => getRestaurantOptionsFromAdmin(),
  current: () => rpc<any>('food_admin_current'),
  history: () => rpc<any[]>('food_admin_history'),
  openCycle: (restaurantId: string) => rpc('food_admin_open_cycle', { p_restaurant_id: restaurantId }),
  async updateRestaurantHours(restaurantId: string, openingHours: OpeningDay[]) {
    return normalizeRestaurant(await rpc<Raw>('food_admin_update_restaurant_hours', { p_restaurant_id: restaurantId, p_opening_hours: openingHours }));
  },
  closeCycle: (cycleId: string, serviceFeeCents: number) => rpc('food_admin_close_cycle', { p_cycle_id: cycleId, p_service_fee_cents: serviceFeeCents }),
};

async function getRestaurantOptionsFromAdmin() {
  return (await rpc<Raw[]>('food_admin_catalog') ?? []).map(normalizeRestaurant).filter((item): item is Restaurant => item !== null);
}
