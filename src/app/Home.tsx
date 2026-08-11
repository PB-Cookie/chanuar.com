import type { PropsWithChildren } from 'react';
import { Link, NavLink } from 'react-router';
import './portfolio.css';

export function PortfolioShell({ children }: PropsWithChildren) {
  return (
    <div className="portfolio-shell">
      <a className="portfolio-skip" href="#main-content">
        Saltar al contenido
      </a>
      <header className="portfolio-header">
        <NavLink className="portfolio-brand" to="/" end aria-label="chanuar.com, inicio">
          <span aria-hidden="true" />
          @chanuar
        </NavLink>
        <nav aria-label="Navegación principal">
          <Link to="/#proyectos">Proyectos</Link>
          <a href="mailto:carlos@chanuar.com">Contacto</a>
        </nav>
      </header>
      {children}
      <footer className="portfolio-footer">
        <span>© {new Date().getFullYear()} Carlos Chanuar</span>
        <a href="mailto:carlos@chanuar.com">carlos@chanuar.com</a>
      </footer>
    </div>
  );
}

export function Home() {
  return (
    <PortfolioShell>
      <main id="main-content" className="portfolio-main" tabIndex={-1}>
        <section className="portfolio-hero" aria-labelledby="portfolio-title">
          <p className="portfolio-eyebrow">Desarrollador full stack</p>
          <h1 id="portfolio-title">Carlos Alberto Chanuar Martínez</h1>
          <p className="portfolio-handle">@chanuar</p>
          <p className="portfolio-intro">
            Desarrollo aplicaciones web, desde la interfaz hasta el backend.
          </p>
          <div className="portfolio-actions">
            <a className="portfolio-button" href="#proyectos">
              Ver proyectos
            </a>
            <a
              className="portfolio-button portfolio-button--quiet"
              href="mailto:carlos@chanuar.com"
            >
              Escribirme
            </a>
          </div>
          <nav className="portfolio-social" aria-label="Perfiles y contacto">
            <a href="https://github.com/chanuar" rel="me">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href="https://www.linkedin.com/in/carlos-chanuar-mart%C3%ADnez-591653251/" rel="me">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a href="mailto:carlos@chanuar.com">Email</a>
          </nav>
        </section>

        <section id="proyectos" className="portfolio-projects" aria-labelledby="projects-title">
          <div className="portfolio-section-heading">
            <p className="portfolio-eyebrow">Trabajo reciente</p>
            <h2 id="projects-title">Proyectos</h2>
          </div>
          <div className="portfolio-grid">
            <article className="portfolio-card">
              <Link
                className="portfolio-card__link"
                to="/skinfolio"
                aria-labelledby="skinfolio-title"
                aria-describedby="skinfolio-description"
              >
                <span className="portfolio-card__number" aria-hidden="true">
                  01
                </span>
                <p>League of Legends</p>
                <div className="portfolio-card__body">
                  <h3 id="skinfolio-title">Skinfolio</h3>
                  <span id="skinfolio-description">
                    Una colección personal de skins, chromas, ofertas y progreso.
                  </span>
                </div>
                <ul className="portfolio-tags" aria-label="Tecnologías">
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Supabase</li>
                </ul>
                <strong className="portfolio-card__cta">
                  Ver proyecto <span aria-hidden="true">↗</span>
                </strong>
              </Link>
            </article>
            <article className="portfolio-card">
              <Link
                className="portfolio-card__link"
                to="/food"
                aria-labelledby="food-title"
                aria-describedby="food-description"
              >
                <span className="portfolio-card__number" aria-hidden="true">
                  02
                </span>
                <p>Pedidos de equipo</p>
                <div className="portfolio-card__body">
                  <h3 id="food-title">Mesa abierta</h3>
                  <span id="food-description">
                    Una forma sencilla de reunir el pedido semanal en un solo lugar.
                  </span>
                </div>
                <ul className="portfolio-tags" aria-label="Tecnologías">
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Supabase</li>
                </ul>
                <strong className="portfolio-card__cta">
                  Ver proyecto <span aria-hidden="true">↗</span>
                </strong>
              </Link>
            </article>
          </div>
        </section>
      </main>
    </PortfolioShell>
  );
}
