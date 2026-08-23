import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import './portfolio.css';

export function RouteError() {
  const { t } = useTranslation();

  return (
    <div className="portfolio-shell">
      <title>{t('routeError.metaTitle')}</title>
      <meta name="robots" content="noindex, nofollow" />
      <a className="portfolio-skip" href="#main-content">
        {t('shell.skip')}
      </a>
      <main id="main-content" className="portfolio-not-found" tabIndex={-1}>
        <p className="portfolio-not-found__code">500</p>
        <h1>{t('routeError.title')}</h1>
        <span>{t('routeError.description')}</span>
        <Link className="portfolio-button" to="/">
          {t('routeError.action')}
        </Link>
      </main>
    </div>
  );
}
