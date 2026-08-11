export default function FoodHeader({ compact = false }) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return (
    <>
      <a className="food-skip-link" href="#main-content">Saltar al contenido principal</a>
      <header className={`food-header${compact ? ' food-header--compact' : ''}`}>
        <a className="food-brand" href="/food" aria-label="Mesa abierta, inicio" aria-current={path === '/food' ? 'page' : undefined}>
          <span className="food-brand__mark" aria-hidden="true">M</span>
          <span><strong>Mesa abierta</strong><small>El pedido de la semana</small></span>
        </a>
        <nav className="food-header__nav" aria-label="Navegación de Mesa abierta">
          <a href="/food/options" aria-current={path === '/food/options' ? 'page' : undefined}>Restaurantes</a>
          <a href="/food/admin" aria-current={path === '/food/admin' ? 'page' : undefined}>Administración</a>
        </nav>
      </header>
    </>
  );
}
