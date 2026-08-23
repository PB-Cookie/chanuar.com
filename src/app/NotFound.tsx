import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <main id="main-content" className="portfolio-not-found" tabIndex={-1}>
      <p className="portfolio-not-found__code">404</p>
      <h1>{t('notFound.title')}</h1>
      <span>{t('notFound.description')}</span>
      <Link className="portfolio-button" to="/">
        {t('notFound.action')}
      </Link>
    </main>
  );
}
