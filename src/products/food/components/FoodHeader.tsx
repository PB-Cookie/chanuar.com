import { NavLink } from 'react-router';

export default function FoodHeader({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <a className="food-skip-link" href="#main-content">Saltar al contenido principal</a>
      <header className={`food-header${compact ? ' food-header--compact' : ''}`}>
        <NavLink className="food-brand" to="/food" end aria-label="Mesa abierta, inicio">
          <span className="food-brand__mark" aria-hidden="true">M</span>
          <span><strong>Mesa abierta</strong><small>El pedido de la semana</small></span>
        </NavLink>
        <nav className="food-header__nav" aria-label="Navegación de Mesa abierta">
          <NavLink to="/food/options">Restaurantes</NavLink>
          <NavLink to="/food/admin">Administración</NavLink>
        </nav>
      </header>
    </>
  );
}
