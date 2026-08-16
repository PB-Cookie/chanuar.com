import { NavLink, Outlet } from 'react-router';
import { ContactForm } from './ContactForm';
import './portfolio.css';

export function PortfolioShell() {
  return (
    <div className="portfolio-shell">
      <a className="portfolio-skip" href="#main-content">
        Saltar al contenido
      </a>
      <header className="portfolio-header">
        <NavLink className="portfolio-brand" to="/" end aria-label="chanuar.com, inicio">
          <span aria-hidden="true">C.</span>
          <span>@chanuar</span>
        </NavLink>
        <nav aria-label="Navegación principal">
          <a href="/#proyectos">01 Proyectos</a>
          <a href="/#tecnologias">02 Stack</a>
          <a href="/#contacto">03 Contacto</a>
        </nav>
      </header>
      <Outlet />
      <footer id="contacto" className="portfolio-footer" aria-labelledby="contact-title">
        <div className="portfolio-contact__intro">
          <p className="portfolio-label">03 / Contacto</p>
          <h2 id="contact-title">Contáctame</h2>
          <p className="portfolio-contact__copy">
            Envíame un mensaje a través del formulario o escríbeme por email.
          </p>
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
          <a href="https://www.linkedin.com/in/carlos-chanuar-mart%C3%ADnez-591653251/" rel="me">
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
