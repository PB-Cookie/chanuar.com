import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { ContactForm } from './ContactForm';
import './portfolio.css';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

export function PortfolioShell() {
  const { i18n, t } = useTranslation();

  useGSAP(() => {
    ScrollSmoother.create({
      smooth: 1,
      effects: true,
    });
  });
  return (
    <>
      <a className="portfolio-skip" href="#main-content">
        {t('shell.skip')}
      </a>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="portfolio-shell">
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
                <fieldset className="portfolio-language">
                  <legend className="portfolio-visually-hidden">{t('language')}</legend>
                  <label>
                    <input
                      className="portfolio-visually-hidden"
                      type="radio"
                      name="language"
                      value="es"
                      checked={i18n.resolvedLanguage === 'es'}
                      onChange={() => void i18n.changeLanguage('es')}
                    />
                    <span>ES</span>
                  </label>
                  <label>
                    <input
                      className="portfolio-visually-hidden"
                      type="radio"
                      name="language"
                      value="en"
                      checked={i18n.resolvedLanguage === 'en'}
                      onChange={() => void i18n.changeLanguage('en')}
                    />
                    <span>EN</span>
                  </label>
                </fieldset>
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
        </div>
      </div>
    </>
  );
}
