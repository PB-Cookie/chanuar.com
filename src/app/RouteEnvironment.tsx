import { useEffect } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router';

const META = {
  skinfolio: {
    title: 'Skinfolio — Colección de skins',
    description: 'Mi colección de skins de League of Legends: skins, chromas, ofertas y progreso.',
    theme: '#010a13',
    siteName: 'Skinfolio',
    image:
      'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/ahri/skins/skin27/images/ahri_splash_centered_27.jpg',
    icon: '/favicon.svg',
  },
  food: {
    title: 'Mesa abierta — El pedido de la semana',
    description:
      'Elige restaurante, comparte la carta y reúne el pedido semanal del equipo en un solo lugar.',
    theme: '#f7f1e7',
    siteName: 'Mesa abierta',
    image: '/food-og.png',
    icon: '/food-og.png',
  },
  options: {
    title: 'Restaurantes — Mesa abierta',
    description:
      'Consulta los restaurantes disponibles, descubre su propuesta y abre su carta en Uber Eats.',
    theme: '#f7f1e7',
    siteName: 'Mesa abierta',
    image: '/food-og.png',
    icon: '/food-og.png',
  },
  admin: {
    title: 'Administración — Mesa abierta',
    description: 'Administración segura del pedido semanal del equipo.',
    theme: '#f7f1e7',
    siteName: 'Mesa abierta',
    image: '/food-og.png',
    icon: '/food-og.png',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    theme: '#f7f1e7',
    siteName: 'chanuar.com',
    image: '/food-og.png',
    icon: '/food-og.png',
  },
} as const;

export type Page = keyof typeof META;

export function RouteEnvironment() {
  const matches = useMatches();
  const location = useLocation();
  const page = [...matches]
    .reverse()
    .find((match) => (match.handle as { page?: Page } | undefined)?.page);
  const name = (page?.handle as { page: Page } | undefined)?.page ?? 'notFound';
  const meta = META[name];
  const image = new URL(meta.image, window.location.origin).href;

  useEffect(() => {
    document.documentElement.lang = 'es';
    document.body.className =
      name === 'skinfolio'
        ? 'skinfolio-page'
        : name === 'notFound'
          ? 'not-found-page'
          : 'food-page';
  }, [name]);

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
      <meta property="og:url" content={new URL(location.pathname, window.location.origin).href} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={name === 'skinfolio' ? '1280' : '1536'} />
      <meta property="og:image:height" content={name === 'skinfolio' ? '720' : '1024'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />
      {name === 'admin' && <meta name="robots" content="noindex, nofollow" />}
      <link
        rel="icon"
        type={meta.icon.endsWith('.svg') ? 'image/svg+xml' : 'image/png'}
        href={meta.icon}
      />
      {name === 'skinfolio' && (
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/beaufort-bold.woff2"
        />
      )}
      {name === 'skinfolio' && (
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/spiegel-regular.woff2"
        />
      )}
      <Outlet />
    </>
  );
}
