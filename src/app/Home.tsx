import { useTranslation } from 'react-i18next';

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

export function Home() {
  const { t } = useTranslation();

  return (
    <main id="main-content" className="portfolio-main" tabIndex={-1}>
      <section className="portfolio-hero" aria-labelledby="portfolio-title">
        <div className="portfolio-hero__meta">
          <p className="portfolio-label">{t('home.profileLabel')}</p>
          <p>{t('home.role')}</p>
          <p>{t('home.areas')}</p>
        </div>
        <h1 id="portfolio-title">
          <span>Carlos Alberto</span> <span>Chanuar Martínez</span>
        </h1>
        <div className="portfolio-hero__summary">
          <p>{t('home.summary')}</p>
          <a className="portfolio-button" href="#proyectos">
            {t('home.explore')} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section id="proyectos" className="portfolio-projects" aria-labelledby="projects-title">
        <div className="portfolio-section-heading">
          <p className="portfolio-label">{t('home.projectsLabel')}</p>
          <h2 id="projects-title" className="portfolio-visually-hidden">
            {t('home.projectsTitle')}
          </h2>
          <span>{t('home.projectCount')}</span>
        </div>
        <div className="portfolio-project-list">
          <article className="portfolio-project">
            <a
              className="portfolio-project__link"
              href="https://skinfolio.chanuar.com"
              aria-labelledby="skinfolio-title"
              aria-describedby="skinfolio-story"
            >
              <span className="portfolio-project__number" aria-hidden="true">
                01
              </span>
              <div className="portfolio-project__title">
                <p>{t('home.skinfolio.subtitle')}</p>
                <h3 id="skinfolio-title">Skinfolio</h3>
              </div>
              <span className="portfolio-project__status">{t('home.inUse')}</span>
              <div id="skinfolio-story" className="portfolio-project__story">
                <div>
                  <p className="portfolio-label">{t('home.challenge')}</p>
                  <p className="portfolio-project__copy">{t('home.skinfolio.challenge')}</p>
                </div>
                <div>
                  <p className="portfolio-label">{t('home.response')}</p>
                  <p className="portfolio-project__copy">{t('home.skinfolio.response')}</p>
                </div>
                <div className="portfolio-project__pipeline">
                  <p className="portfolio-label">{t('home.skinfolio.pipelineLabel')}</p>
                  <p className="portfolio-project__copy">{t('home.skinfolio.pipeline')}</p>
                  <p className="portfolio-project__flow">
                    {t('home.skinfolio.flowSource')} <span aria-hidden="true">→</span> Node.js{' '}
                    <span aria-hidden="true">→</span> Supabase
                  </p>
                </div>
              </div>
              <ul className="portfolio-tags" aria-label={t('home.technologiesTitle')}>
                <li>React</li>
                <li>TypeScript</li>
                <li>Node.js</li>
                <li>Supabase</li>
              </ul>
              <span className="portfolio-project__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </article>
          <article className="portfolio-project">
            <a
              className="portfolio-project__link"
              href="https://menubox.chanuar.com"
              aria-labelledby="food-title"
              aria-describedby="food-story"
            >
              <span className="portfolio-project__number" aria-hidden="true">
                02
              </span>
              <div className="portfolio-project__title">
                <p>{t('home.menubox.subtitle')}</p>
                <h3 id="food-title">MenuBox</h3>
              </div>
              <span className="portfolio-project__status">{t('home.inUse')}</span>
              <div id="food-story" className="portfolio-project__story">
                <div>
                  <p className="portfolio-label">{t('home.challenge')}</p>
                  <p className="portfolio-project__copy">{t('home.menubox.challenge')}</p>
                </div>
                <div>
                  <p className="portfolio-label">{t('home.response')}</p>
                  <p className="portfolio-project__copy">{t('home.menubox.response')}</p>
                </div>
                <div className="portfolio-project__pipeline">
                  <p className="portfolio-label">{t('home.menubox.pipelineLabel')}</p>
                  <p className="portfolio-project__copy">{t('home.menubox.pipeline')}</p>
                  <p className="portfolio-project__flow">
                    {t('home.menubox.flowSource')} <span aria-hidden="true">→</span> Python +
                    Playwright <span aria-hidden="true">→</span> Supabase
                  </p>
                </div>
              </div>
              <ul className="portfolio-tags" aria-label={t('home.technologiesTitle')}>
                <li>React</li>
                <li>TypeScript</li>
                <li>Python</li>
                <li>Playwright</li>
                <li>Supabase</li>
              </ul>
              <span className="portfolio-project__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </article>
        </div>
      </section>

      <section
        id="tecnologias"
        className="portfolio-technologies"
        aria-labelledby="technologies-title"
      >
        <div className="portfolio-technologies__heading">
          <p className="portfolio-label">{t('home.technologiesLabel')}</p>
          <h2 id="technologies-title" className="portfolio-visually-hidden">
            {t('home.technologiesTitle')}
          </h2>
          <label className="portfolio-technologies__toggle">
            <input type="checkbox" />
            <span className="portfolio-technologies__pause">{t('home.pause')}</span>
            <span className="portfolio-technologies__resume">{t('home.resume')}</span>
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
            <ul aria-label={t('home.technologiesList')}>
              {TECHNOLOGIES.map(([name, icon]) => (
                <li key={name}>
                  <img src={`/icons/${icon}`} alt="" width="72" height="72" />
                  <span className="portfolio-technology__name">{name}</span>
                </li>
              ))}
            </ul>
            <ul aria-hidden="true">
              {TECHNOLOGIES.map(([name, icon]) => (
                <li key={name}>
                  <img src={`/icons/${icon}`} alt="" width="72" height="72" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
