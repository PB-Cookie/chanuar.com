import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { ContactForm } from './ContactForm';
import './portfolio.css';

export function PortfolioShell() {
  const { i18n, t } = useTranslation();

  return (
    <div className="portfolio-shell">
      <a className="portfolio-skip" href="#main-content">
        {t('shell.skip')}
      </a>
      <header className="portfolio-header">
        <NavLink className="portfolio-brand" to="/" end aria-label={t('shell.home')}>
          <span aria-hidden="true">C.</span>
          <span>@chanuar</span>
        </NavLink>
        <div className="portfolio-header__actions">
          <nav aria-label={t('shell.navigation')}>
            <a href="/#proyectos">{t('shell.projects')}</a>
            <a href="/#tecnologias">{t('shell.stack')}</a>
            <a href="/#contacto">{t('shell.contact')}</a>
          </nav>
          <select
            className="portfolio-language"
            aria-label={t('language')}
            value={i18n.resolvedLanguage ?? 'es'}
            onChange={(event) => void i18n.changeLanguage(event.currentTarget.value)}
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>
      </header>
      <Outlet />
      <footer id="contacto" className="portfolio-footer" aria-labelledby="contact-title">
        <div className="portfolio-contact__intro">
          <p className="portfolio-label">{t('shell.contactLabel')}</p>
          <h2 id="contact-title">{t('shell.contactTitle')}</h2>
          <p className="portfolio-contact__copy">{t('shell.contactCopy')}</p>
          <a className="portfolio-contact__fallback" href="mailto:carlos@chanuar.com">
            carlos@chanuar.com <span aria-hidden="true">↗</span>
          </a>
        </div>
        <ContactForm />
        <div className="portfolio-footer__meta">
          <span>© {new Date().getFullYear()} Carlos Chanuar</span>
          <a href="https://github.com/chanuar" rel="me">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/carlos-chanuar/" rel="me">
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
