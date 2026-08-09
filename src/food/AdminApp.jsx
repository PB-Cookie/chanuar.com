import { useEffect, useMemo, useState } from 'react';
import { foodAdminApi, foodAuth, foodConfigured } from './api.js';
import { formatEuros, formatSpanishDate } from './utils.js';
import FoodHeader from './FoodHeader.jsx';

function AdminSignIn({ onSubmit, pending, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <main className="food-admin-auth">
      <p className="food-kicker">Zona reservada</p>
      <h1>Administración</h1>
      <p>Accede con tu cuenta aprobada para abrir, revisar y cerrar el pedido semanal.</p>
      {!foodConfigured && (
        <div className="food-admin-notice" role="status">
          Falta configurar la conexión con Supabase. Añade las variables indicadas en <code>.env.example</code>.
        </div>
      )}
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(email, password); }}>
        <label className="food-field"><span>Correo electrónico</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="food-field"><span>Contraseña</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <div className="food-form-error" role="alert">{error}</div>}
        <button className="food-button food-button--wide" type="submit" disabled={pending || !foodConfigured}>{pending ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <a className="food-admin-auth__back" href="/food">← Volver al pedido</a>
    </main>
  );
}

function Unauthorized({ email, onSignOut }) {
  return (
    <main className="food-state food-state--centered">
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

function OrderGroups({ cycle }) {
  const [mode, setMode] = useState('people');
  const orders = cycle?.orders ?? [];
  const aggregated = useMemo(() => aggregateItems(orders), [orders]);
  const total = orders.reduce((sum, order) => sum + (order.total_cents ?? order.totalCents ?? 0), 0);
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
      <div className="food-admin-grand-total"><span>Total del pedido</span><strong>{formatEuros(total)}</strong></div>
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

function History({ cycles }) {
  return (
    <section className="food-admin-history">
      <div className="food-section-heading"><div><p className="food-kicker">Archivo</p><h2>Semanas anteriores</h2></div><span>{cycles.length} ciclos</span></div>
      {!cycles.length ? <div className="food-inline-empty">Aún no hay pedidos cerrados.</div> : cycles.map((cycle) => (
        <details key={cycle.id} className="food-history-cycle">
          <summary><span><strong>{cycle.restaurant?.name ?? cycle.restaurant_name}</strong><small>{formatSpanishDate(cycle.closed_at ?? cycle.closedAt)}</small></span><span>{cycle.orders?.length ?? 0} pedidos · {formatEuros(cycle.total_cents ?? cycle.totalCents ?? 0)}</span></summary>
          <div className="food-history-cycle__body">
            {(cycle.orders ?? []).map((order) => <div className="food-history-order" key={order.id}><div><strong>{order.display_name ?? order.displayName}</strong><span>{(order.items ?? []).map((item) => `${item.quantity} × ${item.item_name ?? item.name}`).join(' · ')}</span></div><strong>{formatEuros(order.total_cents ?? order.totalCents)}</strong></div>)}
          </div>
        </details>
      ))}
    </section>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState(undefined);
  const [authorized, setAuthorized] = useState(undefined);
  const [catalog, setCatalog] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('current');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    let mounted = true;
    foodAuth.session().then((value) => { if (mounted) setSession(value); }).catch((sessionError) => { if (mounted) { setSession(null); setError(sessionError.message); } });
    const unsubscribe = foodAuth.onChange((value) => { setSession(value); if (!value) setAuthorized(undefined); });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  useEffect(() => { if (session) loadDashboard(); }, [session]);

  async function signIn(email, password) {
    setPending(true); setError('');
    try { setSession(await foodAuth.signIn(email, password)); }
    catch (signInError) { setError(signInError.message); }
    finally { setPending(false); }
  }

  async function signOut() {
    setPending(true);
    try { await foodAuth.signOut(); setSession(null); }
    catch (signOutError) { setError(signOutError.message); }
    finally { setPending(false); }
  }

  async function openCycle(restaurantId) {
    setPending(true); setError('');
    try { await foodAdminApi.openCycle(restaurantId); await loadDashboard(); }
    catch (openError) { setError(openError.message); }
    finally { setPending(false); }
  }

  async function closeCycle() {
    if (!window.confirm('Al cerrar el pedido nadie podrá enviarlo ni editarlo. ¿Quieres continuar?')) return;
    setPending(true); setError('');
    try { await foodAdminApi.closeCycle(current.cycle.id); await loadDashboard(); setTab('history'); }
    catch (closeError) { setError(closeError.message); }
    finally { setPending(false); }
  }

  if (session === undefined) return <div className="food-shell"><FoodHeader compact /><main className="food-state"><div className="food-skeleton food-skeleton--title" /><div className="food-skeleton food-skeleton--hero" /></main></div>;
  if (!session) return <div className="food-shell"><FoodHeader compact /><AdminSignIn onSubmit={signIn} pending={pending} error={error} /></div>;
  if (authorized === false) return <div className="food-shell"><FoodHeader compact /><Unauthorized email={session.user.email} onSignOut={signOut} /></div>;

  return (
    <div className="food-shell food-shell--admin">
      <FoodHeader compact />
      <main className="food-admin">
        <header className="food-admin__header">
          <div><p className="food-kicker">Panel de equipo</p><h1>Pedido semanal</h1><p>{session.user.email}</p></div>
          <button className="food-button food-button--quiet" type="button" onClick={signOut} disabled={pending}>Cerrar sesión</button>
        </header>
        <nav className="food-admin-tabs" aria-label="Secciones de administración">
          <button type="button" className={tab === 'current' ? 'is-active' : ''} onClick={() => setTab('current')}>Semana actual</button>
          <button type="button" className={tab === 'history' ? 'is-active' : ''} onClick={() => setTab('history')}>Historial <span>{history.length}</span></button>
        </nav>
        {error && <div className="food-admin-error" role="alert"><span>{error}</span><button type="button" onClick={loadDashboard}>Reintentar</button></div>}
        {authorized === undefined ? <div className="food-state food-state--inline" aria-busy="true">Comprobando permisos…</div> : tab === 'history' ? <History cycles={history} /> : current ? (
          <>
            <section className="food-admin-current">
              <div><p className="food-kicker">Pedido abierto</p><h2>{current.restaurant.name}</h2><p>Desde {formatSpanishDate(current.cycle.opened_at ?? current.cycle.openedAt)}</p></div>
              <button className="food-button food-button--danger" type="button" onClick={closeCycle} disabled={pending}>{pending ? 'Cerrando…' : 'Cerrar pedido'}</button>
            </section>
            <OrderGroups cycle={current} />
          </>
        ) : <OpenCycleCard catalog={catalog} onOpen={openCycle} pending={pending} />}
      </main>
    </div>
  );
}

export { aggregateItems, AdminSignIn, History, OrderGroups };
