export default function FoodHeader({ compact = false }) {
  return (
    <header className={`food-header${compact ? ' food-header--compact' : ''}`}>
      <a className="food-brand" href="/food" aria-label="Mesa abierta, inicio">
        <span className="food-brand__mark" aria-hidden="true">M</span>
        <span><strong>Mesa abierta</strong><small>El pedido de la semana</small></span>
      </a>
      <nav className="food-header__nav" aria-label="Navegación de Mesa abierta">
        <a href="/food/options">Restaurantes</a>
        <a href="/food/admin">Administración</a>
      </nav>
    </header>
  );
}
