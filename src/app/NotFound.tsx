import { Link } from 'react-router';
import { PortfolioShell } from './PortfolioShell';

export function NotFound() {
  return (
    <PortfolioShell>
      <main id="main-content" className="portfolio-not-found" tabIndex={-1}>
        <p className="portfolio-not-found__code">404</p>
        <h1>Esta página no existe.</h1>
        <span>Puede que la dirección haya cambiado o que nunca haya estado aquí.</span>
        <Link className="portfolio-button" to="/">
          Volver al portfolio
        </Link>
      </main>
    </PortfolioShell>
  );
}
