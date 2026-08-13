import type { PropsWithChildren } from 'react';
import { Link, NavLink } from 'react-router';
import './portfolio.css';

const TECHNOLOGIES = [
  ['PostgreSQL', 'postgresql/postgresql-original.svg'],
  ['Next.js', 'nextjs/nextjs-original.svg'],
  ['React', 'react/react-original.svg'],
  ['JavaScript', 'javascript/javascript-original.svg'],
  ['TypeScript', 'typescript/typescript-original.svg'],
  ['Java', 'java/java-original.svg'],
  ['Python', 'python/python-original.svg'],
  ['FastAPI', 'fastapi/fastapi-original.svg'],
  ['Spring Boot', 'spring/spring-original.svg'],
  ['HTML', 'html5/html5-original.svg'],
  ['CSS', 'css3/css3-original.svg'],
  ['Node.js', 'nodejs/nodejs-original.svg'],
  ['Vite', 'vitejs/vitejs-original.svg'],
  ['Supabase', 'supabase/supabase-original.svg'],
  ['Git', 'git/git-original.svg'],
  ['GitHub', 'github/github-original.svg'],
  ['Docker', 'docker/docker-original.svg'],
];

export function PortfolioShell({ children }: PropsWithChildren) {
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
      {children}
      <footer id="contacto" className="portfolio-footer">
        <div>
          <p className="portfolio-label">03 / Contacto</p>
          <p>¿Construimos algo?</p>
        </div>
        <a className="portfolio-footer__email" href="mailto:carlos@chanuar.com">
          carlos@chanuar.com <span aria-hidden="true">↗</span>
        </a>
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

export function Home() {
  return (
    <PortfolioShell>
      <main id="main-content" className="portfolio-main" tabIndex={-1}>
        <section className="portfolio-hero" aria-labelledby="portfolio-title">
          <div className="portfolio-hero__meta">
            <p className="portfolio-label">00 / Perfil</p>
            <p>Desarrollador full stack</p>
            <p>Interfaces · Datos · Producto</p>
          </div>
          <h1 id="portfolio-title">
            <span>Carlos Alberto</span> <span>Chanuar Martínez</span>
          </h1>
          <div className="portfolio-hero__summary">
            <p>Diseño y desarrollo aplicaciones web completas, de la interfaz al backend.</p>
            <a className="portfolio-button" href="#proyectos">
              Explorar trabajo <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section id="proyectos" className="portfolio-projects" aria-labelledby="projects-title">
          <div className="portfolio-section-heading">
            <p className="portfolio-label">01 / Proyectos seleccionados</p>
            <h2 id="projects-title">Productos en uso</h2>
            <span>02 proyectos</span>
          </div>
          <div className="portfolio-project-list">
            <article className="portfolio-project">
              <Link
                className="portfolio-project__link"
                to="/skinfolio"
                aria-labelledby="skinfolio-title"
                aria-describedby="skinfolio-story"
              >
                <span className="portfolio-project__number" aria-hidden="true">
                  01
                </span>
                <div className="portfolio-project__title">
                  <p>Colección personal · League of Legends</p>
                  <h3 id="skinfolio-title">Skinfolio</h3>
                </div>
                <span className="portfolio-project__status">En uso</span>
                <div id="skinfolio-story" className="portfolio-project__story">
                  <div>
                    <p className="portfolio-label">El reto</p>
                    <p>Entender una colección creciente sin perderse entre skins y chromas.</p>
                  </div>
                  <div>
                    <p className="portfolio-label">La respuesta</p>
                    <p>Un catálogo personal con propiedad, ofertas y progreso en un solo lugar.</p>
                  </div>
                </div>
                <ul className="portfolio-tags" aria-label="Tecnologías">
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Supabase</li>
                </ul>
                <span className="portfolio-project__arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </article>
            <article className="portfolio-project">
              <Link
                className="portfolio-project__link"
                to="/food"
                aria-labelledby="food-title"
                aria-describedby="food-story"
              >
                <span className="portfolio-project__number" aria-hidden="true">
                  02
                </span>
                <div className="portfolio-project__title">
                  <p>Pedidos de equipo · Restauración</p>
                  <h3 id="food-title">MenuBox</h3>
                </div>
                <span className="portfolio-project__status">En uso</span>
                <div id="food-story" className="portfolio-project__story">
                  <div>
                    <p className="portfolio-label">El reto</p>
                    <p>Coordinar el pedido semanal de varias personas sin perder elecciones.</p>
                  </div>
                  <div>
                    <p className="portfolio-label">La respuesta</p>
                    <p>Un flujo compartido para elegir restaurante, revisar y reunir el pedido.</p>
                  </div>
                </div>
                <ul className="portfolio-tags" aria-label="Tecnologías">
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Supabase</li>
                </ul>
                <span className="portfolio-project__arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </article>
          </div>
        </section>

        <section
          id="tecnologias"
          className="portfolio-technologies"
          aria-labelledby="technologies-title"
        >
          <div className="portfolio-technologies__heading">
            <p className="portfolio-label">02 / Stack</p>
            <h2 id="technologies-title" className="portfolio-visually-hidden">
              Tecnologías
            </h2>
            <label className="portfolio-technologies__toggle">
              <input type="checkbox" />
              <span className="portfolio-technologies__pause">Pausar</span>
              <span className="portfolio-technologies__resume">Reanudar</span>
              <span className="portfolio-technologies__pause-icon" aria-hidden="true">
                Ⅱ
              </span>
              <span className="portfolio-technologies__resume-icon" aria-hidden="true">
                ▶
              </span>
            </label>
          </div>
          <div className="portfolio-technologies__viewport">
            <div className="portfolio-technologies__track">
              <ul aria-label="Tecnologías que utilizo">
                {TECHNOLOGIES.map(([name, icon]) => (
                  <li key={name}>
                    <img
                      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon}`}
                      alt=""
                      width="72"
                      height="72"
                    />
                    <span className="portfolio-technology__name">{name}</span>
                  </li>
                ))}
              </ul>
              <ul aria-hidden="true">
                {TECHNOLOGIES.map(([name, icon]) => (
                  <li key={name}>
                    <img
                      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon}`}
                      alt=""
                      width="72"
                      height="72"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </PortfolioShell>
  );
}
