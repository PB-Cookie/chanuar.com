import { Link } from 'react-router';
import './portfolio.css';

export function RouteError() {
  return (
    <div className="portfolio-shell">
      <title>Algo salió mal — chanuar.com</title>
      <meta name="robots" content="noindex, nofollow" />
      <a className="portfolio-skip" href="#main-content">
        Saltar al contenido
      </a>
      <main id="main-content" className="portfolio-not-found" tabIndex={-1}>
        <p className="portfolio-not-found__code">500</p>
        <h1>Algo salió mal.</h1>
        <span>No se pudo cargar esta página.</span>
        <Link className="portfolio-button" to="/">
          Volver al portfolio
        </Link>
      </main>
    </div>
  );
}
