import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router';

const META = {
  home: {
    title: 'Carlos Chanuar',
    description:
      'Portfolio de Carlos Alberto Chanuar Martínez, desarrollador full stack. Proyectos web y formas de contacto.',
    image: '/portfolio-og.png',
  },
  notFound: {
    title: 'Página no encontrada — chanuar.com',
    description: 'La página que buscas no existe.',
    image: '/favicon.svg',
  },
} as const;

export type Page = keyof typeof META;

export function RouteEnvironment() {
  const matches = useMatches();
  const location = useLocation();
  const name = (matches.at(-1)?.handle as Page | undefined) ?? 'notFound';
  const meta = META[name];
  const image = new URL(meta.image, window.location.origin).href;
  const canonicalPath = name === 'home' ? '/' : undefined;
  const pageUrl = new URL(canonicalPath ?? location.pathname, window.location.origin).href;
  const previousPath = useRef(location.pathname);

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
      <meta name="theme-color" content="#08090b" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:site_name" content="chanuar.com" />
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
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <Outlet />
    </>
  );
}
