import { NavLink, useInRouterContext } from 'react-router';

export default function FoodHeader({ compact = false }: { compact?: boolean }) {
  const routed = useInRouterContext();
  return (
    <>
      <a className="food-skip-link" href="#main-content">Saltar al contenido principal</a>
      <header className={`food-header${compact ? ' food-header--compact' : ''}`}>
        {routed ? <NavLink className="food-brand" to="/food" end aria-label="Mesa abierta, inicio">
          <span className="food-brand__mark" aria-hidden="true">M</span>
          <span><strong>Mesa abierta</strong><small>El pedido de la semana</small></span>
        </NavLink> : <a className="food-brand" href="/food" aria-label="Mesa abierta, inicio">
          <span className="food-brand__mark" aria-hidden="true">M</span>
          <span><strong>Mesa abierta</strong><small>El pedido de la semana</small></span>
        </a>}
        <nav className="food-header__nav" aria-label="Navegación de Mesa abierta">
          {routed ? <NavLink to="/food/options">Restaurantes</NavLink> : <a href="/food/options">Restaurantes</a>}
          {routed ? <NavLink to="/food/admin">Administración</NavLink> : <a href="/food/admin">Administración</a>}
        </nav>
      </header>
    </>
  );
}
