import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router';

const META = {
  home: {
    title: 'Carlos Chanuar — Desarrollador full stack',
    description:
      'Portfolio de Carlos Alberto Chanuar Martínez, desarrollador full stack. Proyectos web y formas de contacto.',
    theme: '#08090b',
    siteName: 'chanuar.com',
    image: '/portfolio-og.png',
    icon: '/favicon.svg',
  },
  notFound: {
    title: 'Página no encontrada — chanuar.com',
    description: 'La página que buscas no existe.',
    theme: '#08090b',
    siteName: 'chanuar.com',
    image: '/favicon.svg',
    icon: '/favicon.svg',
  },
} as const;

export type Page = keyof typeof META;

const CANONICAL_PATH: Partial<Record<Page, string>> = {
  home: '/',
};

export function RouteEnvironment() {
  const matches = useMatches();
  const location = useLocation();
  const page = [...matches]
    .reverse()
    .find((match) => (match.handle as { page?: Page } | undefined)?.page);
  const name = (page?.handle as { page: Page } | undefined)?.page ?? 'notFound';
  const meta = META[name];
  const image = new URL(meta.image, window.location.origin).href;
  const canonicalPath = CANONICAL_PATH[name];
  const pageUrl = new URL(canonicalPath ?? location.pathname, window.location.origin).href;
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    document.documentElement.lang = 'es';
    document.body.className = 'portfolio-page';
  }, [name]);

  useEffect(() => {
    const routeChanged = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;

    if (routeChanged) {
      document.getElementById('main-content')?.focus();
    }
  }, [location.pathname]);

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="theme-color" content={meta.theme} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:site_name" content={meta.siteName} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={name === 'notFound' ? '64' : '1536'} />
      <meta property="og:image:height" content={name === 'notFound' ? '64' : '1024'} />
      <meta name="twitter:card" content={name === 'notFound' ? 'summary' : 'summary_large_image'} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />
      {name === 'notFound' && <meta name="robots" content="noindex, nofollow" />}
      {canonicalPath && <link rel="canonical" href={pageUrl} />}
      <link
        rel="icon"
        type={meta.icon.endsWith('.svg') ? 'image/svg+xml' : 'image/png'}
        href={meta.icon}
      />
      <Outlet />
    </>
  );
}
