// @ts-nocheck -- existing presentation markup; typed loader/API boundaries remain enforced.
import { useEffect, useMemo, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router';
import { foodAdminApi, foodAuth, foodConfigured } from '../api/foodApi';
import { formatEuros, formatSpanishDate } from '../model/order';
import FoodHeader from '../components/FoodHeader';
import { OpeningHours, OpeningHoursForm } from '../components/OpeningHours';
import { FoodApiError } from '../api/foodApi';
import { useFoodSession } from './useFoodSession';
import type { AdminRouteData } from '../model/types';

export async function loader(): Promise<AdminRouteData> {
  const session = await foodAuth.session();
  if (!session) return { session: null, authorized: undefined, catalog: [], current: null, history: [] };
  try {
    const authorized = Boolean(await foodAdminApi.access());
    if (!authorized) return { session, authorized: false, catalog: [], current: null, history: [] };
    const [catalog, current, history] = await Promise.all([foodAdminApi.catalog(), foodAdminApi.current(), foodAdminApi.history()]);
    return { session, authorized: true, catalog, current, history: history ?? [] };
  } catch (error) {
    if (error instanceof FoodApiError && error.code === 'FOOD_FORBIDDEN') return { session, authorized: false, catalog: [], current: null, history: [] };
    throw error;
  }
}

function parseServiceFee(value) {
  const normalized = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) && cents >= 0 && cents <= 1_000_000 ? cents : null;
}

function AdminSignIn({ onSubmit, pending, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <main id="main-content" className="food-admin-auth" tabIndex={-1}>
      <p className="food-kicker">Zona reservada</p>
      <h1>Administración</h1>
      <p>Accede con tu cuenta aprobada para abrir, revisar y cerrar el pedido semanal.</p>
      {!foodConfigured && (
        <div className="food-admin-notice" role="status">
          Falta configurar la conexión con Supabase. Añade las variables indicadas en <code>.env.example</code>.
        </div>
      )}
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(email, password); }}>
        <label className="food-field"><span>Correo electrónico</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'food-sign-in-error' : undefined} /></label>
        <label className="food-field"><span>Contraseña</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'food-sign-in-error' : undefined} /></label>
        {error && <div id="food-sign-in-error" className="food-form-error" role="alert">{error}</div>}
        <button className="food-button food-button--wide" type="submit" disabled={pending || !foodConfigured}>{pending ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <a className="food-admin-auth__back" href="/food">← Volver al pedido</a>
    </main>
  );
}

function Unauthorized({ email, onSignOut }) {
  return (
    <main id="main-content" className="food-state food-state--centered" tabIndex={-1}>
      <div className="food-state__symbol food-state__symbol--error" aria-hidden="true">!</div>
      <p className="food-kicker">Acceso limitado</p>
      <h1>Esta cuenta no es administradora</h1>
      <p>{email} ha iniciado sesión correctamente, pero no está incluida en la lista de administradores de pedidos.</p>
      <button className="food-button food-button--quiet" type="button" onClick={onSignOut}>Cerrar sesión</button>
    </main>
  );
}

function aggregateItems(orders) {
  const items = new Map();
  for (const order of orders ?? []) {
    for (const item of order.items ?? []) {
      const id = item.menu_item_id ?? item.menuItemId ?? item.item_name;
      const current = items.get(id) ?? { name: item.item_name ?? item.name, quantity: 0, totalCents: 0, notes: [] };
      current.quantity += item.quantity;
      current.totalCents += (item.unit_price_cents ?? item.unitPriceCents) * item.quantity;
      if (item.note) current.notes.push(`${order.display_name ?? order.displayName}: ${item.note}`);
      items.set(id, current);
    }
  }
  return [...items.values()].sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, 'es'));
}

function CycleTotals({ cycle, serviceFeeCents = undefined }) {
  const orders = useMemo(() => cycle?.orders ?? [], [cycle?.orders]);
  const calculatedSubtotal = orders.reduce((sum, order) => sum + (order.total_cents ?? order.totalCents ?? 0), 0);
  const subtotal = cycle?.subtotal_cents ?? cycle?.subtotalCents ?? calculatedSubtotal;
  const fee = serviceFeeCents ?? cycle?.service_fee_cents ?? cycle?.serviceFeeCents ?? 0;
  const total = subtotal + fee;

  return (
    <div className="food-cycle-totals" aria-label="Totales del pedido">
      <div><span>Subtotal de pedidos</span><strong>{formatEuros(subtotal)}</strong></div>
      <div><span>Gastos de servicio</span><strong>{formatEuros(fee)}</strong></div>
      <div className="food-cycle-totals__final"><span>Total</span><strong>{formatEuros(total)}</strong></div>
    </div>
  );
}

function OrderGroups({ cycle, serviceFeeCents }) {
  const [mode, setMode] = useState('people');
  const orders = useMemo(() => cycle?.orders ?? [], [cycle?.orders]);
  const aggregated = useMemo(() => aggregateItems(orders), [orders]);
  return (
    <section className="food-admin-orders">
      <div className="food-admin-orders__heading">
        <div><p className="food-kicker">Pedidos recibidos</p><h2>{orders.length} {orders.length === 1 ? 'persona' : 'personas'}</h2></div>
        <div className="food-admin-toggle" aria-label="Agrupar pedidos">
          <button type="button" className={mode === 'people' ? 'is-active' : ''} onClick={() => setMode('people')} aria-pressed={mode === 'people'}>Por persona</button>
          <button type="button" className={mode === 'items' ? 'is-active' : ''} onClick={() => setMode('items')} aria-pressed={mode === 'items'}>Por plato</button>
        </div>
      </div>
      {!orders.length ? <div className="food-inline-empty">Todavía no ha llegado ningún pedido.</div> : mode === 'people' ? (
        <div className="food-admin-order-list">
          {orders.map((order) => (
            <article key={order.id} className="food-admin-order">
              <div className="food-admin-order__person"><div className="food-avatar" aria-hidden="true">{(order.display_name ?? order.displayName).slice(0, 1).toLocaleUpperCase('es')}</div><div><h3>{order.display_name ?? order.displayName}</h3><span>Actualizado {formatSpanishDate(order.updated_at ?? order.updatedAt)}</span></div><strong>{formatEuros(order.total_cents ?? order.totalCents)}</strong></div>
              <div className="food-admin-order__items">
                {(order.items ?? []).map((item, index) => <div key={item.id ?? index}><span><b>{item.quantity} ×</b> {item.item_name ?? item.name}{item.note && <small>{item.note}</small>}</span><strong>{formatEuros((item.unit_price_cents ?? item.unitPriceCents) * item.quantity)}</strong></div>)}
              </div>
              {(order.note) && <p className="food-admin-order__note"><strong>Nota general:</strong> {order.note}</p>}
            </article>
          ))}
        </div>
      ) : (
        <div className="food-admin-item-list">
          {aggregated.map((item) => <article key={item.name}><span className="food-admin-item-list__quantity">{item.quantity}</span><div><h3>{item.name}</h3>{item.notes.map((note) => <small key={note}>{note}</small>)}</div><strong>{formatEuros(item.totalCents)}</strong></article>)}
        </div>
      )}
      <CycleTotals cycle={cycle} serviceFeeCents={serviceFeeCents} />
    </section>
  );
}

function OpenCycleCard({ catalog, onOpen, pending }) {
  const [restaurantId, setRestaurantId] = useState(catalog[0]?.id ?? '');
  useEffect(() => { if (!catalog.some((restaurant) => restaurant.id === restaurantId)) setRestaurantId(catalog[0]?.id ?? ''); }, [catalog, restaurantId]);
  return (
    <section className="food-admin-open-card">
      <div><p className="food-kicker">Nueva semana</p><h2>Abre un pedido</h2><p>Elige uno de los restaurantes importados que tenga platos disponibles.</p></div>
      {catalog.length ? (
        <form onSubmit={(event) => { event.preventDefault(); onOpen(restaurantId); }}>
          <label className="food-field"><span>Restaurante</span><select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)}>{catalog.map((restaurant) => <option value={restaurant.id} key={restaurant.id}>{restaurant.name} · {restaurant.available_items ?? restaurant.availableItems} platos</option>)}</select></label>
          <button className="food-button" type="submit" disabled={pending || !restaurantId}>{pending ? 'Abriendo…' : 'Abrir pedido semanal'}</button>
        </form>
      ) : <div className="food-inline-empty">No hay restaurantes disponibles con platos importados.</div>}
    </section>
  );
}

function RestaurantHoursManager({ catalog, onSave, pending }) {
  return (
    <section className="food-admin-restaurants" aria-labelledby="restaurant-hours-title">
      <div className="food-section-heading">
        <div><p className="food-kicker">Disponibilidad</p><h2 id="restaurant-hours-title">Horarios de restaurantes</h2></div>
        <span>{catalog.length} restaurantes</span>
      </div>
      <p className="food-admin-restaurants__intro">Configura los días y tramos de apertura. Los cambios aparecen en el pedido y en la página de restaurantes.</p>
      <div className="food-admin-restaurant-list">
        {catalog.map((restaurant) => (
          <details className="food-admin-restaurant" key={restaurant.id}>
            <summary><strong>{restaurant.name}</strong><span>{restaurant.availableItems} platos</span></summary>
            <div className="food-admin-restaurant__body">
              <OpeningHours openingHours={restaurant.openingHours} />
              <OpeningHoursForm restaurant={restaurant} onSave={onSave} pending={pending} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function History({ cycles }) {
  return (
    <section className="food-admin-history">
      <div className="food-section-heading"><div><p className="food-kicker">Archivo</p><h2>Semanas anteriores</h2></div><span>{cycles.length} ciclos</span></div>
      {!cycles.length ? <div className="food-inline-empty">Aún no hay pedidos cerrados.</div> : cycles.map((cycle) => (
        <details key={cycle.id} className="food-history-cycle">
          <summary><span><strong>{cycle.restaurant?.name ?? cycle.restaurant_name}</strong><small>{formatSpanishDate(cycle.closed_at ?? cycle.closedAt)}</small></span><span>{cycle.orders?.length ?? 0} pedidos · {formatEuros(cycle.total_cents ?? cycle.totalCents ?? 0)}</span></summary>
          <div className="food-history-cycle__body">
            {(cycle.orders ?? []).map((order) => <div className="food-history-order" key={order.id}><div><strong>{order.display_name ?? order.displayName}</strong><span>{(order.items ?? []).map((item) => `${item.quantity} × ${item.item_name ?? item.name}`).join(' · ')}</span></div><strong>{formatEuros(order.total_cents ?? order.totalCents)}</strong></div>)}
            <CycleTotals cycle={cycle} />
          </div>
        </details>
      ))}
    </section>
  );
}

export default function AdminApp({ initialData = null, onRevalidate = () => {} } = {}) {
  const [session, setSession] = useFoodSession(initialData ? initialData.session : undefined);
  const [authorized, setAuthorized] = useState(initialData?.authorized);
  const [catalog, setCatalog] = useState(initialData?.catalog ?? []);
  const [current, setCurrent] = useState(initialData?.current ?? null);
  const [history, setHistory] = useState(initialData?.history ?? []);
  const [tab, setTab] = useState('current');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [serviceFee, setServiceFee] = useState('0,00');
  const [serviceFeeError, setServiceFeeError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadDashboard() {
    setError('');
    try {
      const allowed = await foodAdminApi.access();
      setAuthorized(Boolean(allowed));
      if (!allowed) return;
      const [nextCatalog, nextCurrent, nextHistory] = await Promise.all([
        foodAdminApi.catalog(), foodAdminApi.current(), foodAdminApi.history(),
      ]);
      setCatalog(nextCatalog ?? []);
      setCurrent(nextCurrent);
      setHistory(nextHistory ?? []);
    } catch (loadError) {
      if (loadError.code === 'FOOD_FORBIDDEN') setAuthorized(false);
      else setError(loadError.message);
    }
  }

  async function saveRestaurantHours(restaurantId, openingHours) {
    setPending(true); setError(''); setNotice('');
    try {
      const updated = await foodAdminApi.updateRestaurantHours(restaurantId, openingHours);
      setCatalog((currentCatalog) => currentCatalog.map((restaurant) => (
        restaurant.id === restaurantId ? { ...restaurant, ...updated } : restaurant
      )));
      setNotice(`Horario de ${updated.name} guardado.`);
      onRevalidate();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setPending(false);
    }
  }

  function handleTabKeyDown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...event.currentTarget.parentElement.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(event.currentTarget);
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    const next = tabs[nextIndex];
    setTab(next.dataset.tab);
    next.focus();
  }

  useEffect(() => {
    if (!initialData) return;
    setAuthorized(initialData.authorized); setCatalog(initialData.catalog); setCurrent(initialData.current); setHistory(initialData.history);
  }, [initialData]);

  useEffect(() => { if (session && (!initialData || session.user.id !== initialData.session?.user.id)) loadDashboard(); }, [session, initialData]);

  async function signIn(email, password) {
    setPending(true); setError('');
    try { setSession(await foodAuth.signIn(email, password)); onRevalidate(); }
    catch (signInError) { setError(signInError.message); }
    finally { setPending(false); }
  }

  async function signOut() {
    setPending(true);
    try { await foodAuth.signOut(); setSession(null); onRevalidate(); }
    catch (signOutError) { setError(signOutError.message); }
    finally { setPending(false); }
  }

  async function openCycle(restaurantId) {
    setPending(true); setError('');
    try { await foodAdminApi.openCycle(restaurantId); await loadDashboard(); onRevalidate(); }
    catch (openError) { setError(openError.message); }
    finally { setPending(false); }
  }

  async function closeCycle(event) {
    event.preventDefault();
    const serviceFeeCents = parseServiceFee(serviceFee);
    if (serviceFeeCents === null) {
      setServiceFeeError('Introduce un importe válido con un máximo de dos decimales.');
      return;
    }
    if (!window.confirm(`Al cerrar el pedido nadie podrá enviarlo ni editarlo. Gastos de servicio: ${formatEuros(serviceFeeCents)}. ¿Quieres continuar?`)) return;
    setPending(true); setError('');
    setServiceFeeError('');
    try { await foodAdminApi.closeCycle(current.cycle.id, serviceFeeCents); await loadDashboard(); onRevalidate(); setServiceFee('0,00'); setTab('history'); }
    catch (closeError) { setError(closeError.message); }
    finally { setPending(false); }
  }

  if (session === undefined) return <div className="food-shell"><FoodHeader compact /><main id="main-content" className="food-state" tabIndex={-1} aria-busy="true" aria-label="Comprobando la sesión"><div className="food-skeleton food-skeleton--title" /><div className="food-skeleton food-skeleton--hero" /></main></div>;
  if (!session) return <div className="food-shell"><FoodHeader compact /><AdminSignIn onSubmit={signIn} pending={pending} error={error} /></div>;
  if (authorized === false) return <div className="food-shell"><FoodHeader compact /><Unauthorized email={session.user.email} onSignOut={signOut} /></div>;

  return (
    <div className="food-shell food-shell--admin">
      <FoodHeader compact />
      <main id="main-content" className="food-admin" tabIndex={-1}>
        <header className="food-admin__header">
          <div><p className="food-kicker">Panel de equipo</p><h1>Pedido semanal</h1><p>{session.user.email}</p></div>
          <button className="food-button food-button--quiet" type="button" onClick={signOut} disabled={pending}>Cerrar sesión</button>
        </header>
        <div className="food-admin-tabs" role="tablist" aria-label="Secciones de administración">
          <button id="admin-tab-current" data-tab="current" role="tab" type="button" aria-selected={tab === 'current'} aria-controls="admin-panel" tabIndex={tab === 'current' ? 0 : -1} className={tab === 'current' ? 'is-active' : ''} onKeyDown={handleTabKeyDown} onClick={() => setTab('current')}>Semana actual</button>
          <button id="admin-tab-restaurants" data-tab="restaurants" role="tab" type="button" aria-selected={tab === 'restaurants'} aria-controls="admin-panel" tabIndex={tab === 'restaurants' ? 0 : -1} className={tab === 'restaurants' ? 'is-active' : ''} onKeyDown={handleTabKeyDown} onClick={() => setTab('restaurants')}>Restaurantes <span>{catalog.length}</span></button>
          <button id="admin-tab-history" data-tab="history" role="tab" type="button" aria-selected={tab === 'history'} aria-controls="admin-panel" tabIndex={tab === 'history' ? 0 : -1} className={tab === 'history' ? 'is-active' : ''} onKeyDown={handleTabKeyDown} onClick={() => setTab('history')}>Historial <span>{history.length}</span></button>
        </div>
        {error && <div className="food-admin-error" role="alert"><span>{error}</span><button type="button" onClick={loadDashboard}>Reintentar</button></div>}
        {notice && <div className="food-admin-notice" role="status">{notice}</div>}
        <div id="admin-panel" role="tabpanel" aria-labelledby={`admin-tab-${tab}`} tabIndex={0}>
        {authorized === undefined ? <div className="food-state food-state--inline" aria-busy="true">Comprobando permisos…</div> : tab === 'history' ? <History cycles={history} /> : tab === 'restaurants' ? <RestaurantHoursManager catalog={catalog} onSave={saveRestaurantHours} pending={pending} /> : current ? (
          <>
            <section className="food-admin-current">
              <div><p className="food-kicker">Pedido abierto</p><h2>{current.restaurant.name}</h2><p>Desde {formatSpanishDate(current.cycle.opened_at ?? current.cycle.openedAt)}</p><OpeningHours openingHours={catalog.find((restaurant) => restaurant.id === current.restaurant.id)?.openingHours} compact /></div>
              <form className="food-admin-current__close" onSubmit={closeCycle}>
                <label>
                  <span>Gastos de servicio</span>
                  <span className="food-admin-money-input"><span aria-hidden="true">€</span><input inputMode="decimal" value={serviceFee} onChange={(event) => { setServiceFee(event.target.value); setServiceFeeError(''); }} aria-invalid={Boolean(serviceFeeError)} aria-describedby={serviceFeeError ? 'service-fee-error' : undefined} /></span>
                </label>
                <button className="food-button food-button--danger" type="submit" disabled={pending}>{pending ? 'Cerrando…' : 'Cerrar pedido'}</button>
                {serviceFeeError && <small id="service-fee-error" role="alert">{serviceFeeError}</small>}
              </form>
            </section>
            <OrderGroups cycle={current} serviceFeeCents={parseServiceFee(serviceFee) ?? 0} />
          </>
        ) : <OpenCycleCard catalog={catalog} onOpen={openCycle} pending={pending} />}
        </div>
      </main>
    </div>
  );
}

export { aggregateItems, AdminSignIn, CycleTotals, History, OrderGroups, RestaurantHoursManager, parseServiceFee };

export function Component() {
  const revalidator = useRevalidator();
  return <AdminApp initialData={useLoaderData() as AdminRouteData} onRevalidate={() => revalidator.revalidate()} />;
}
