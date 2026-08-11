import { lazy, Suspense, useEffect } from 'react';
import App from './App.jsx';

const FoodApp = lazy(() => import('./food/FoodApp.jsx'));
const AdminApp = lazy(() => import('./food/AdminApp.jsx'));
const OptionsApp = lazy(() => import('./food/OptionsApp.jsx'));

const META = {
  skinfolio: {
    title: 'Skinfolio — Colección de skins',
    description: 'Mi colección de skins de League of Legends: skins, chromas, ofertas y progreso.',
    theme: '#010a13',
    siteName: 'Skinfolio',
    image: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/ahri/skins/skin27/images/ahri_splash_centered_27.jpg',
    imageWidth: '1280',
    imageHeight: '720',
    icon: '/favicon.svg',
  },
  food: {
    title: 'Mesa abierta — El pedido de la semana',
    description: 'Elige restaurante, comparte la carta y reúne el pedido semanal del equipo en un solo lugar.',
    theme: '#f7f1e7',
    siteName: 'Mesa abierta',
    image: '/food-og.png',
    imageWidth: '1536',
    imageHeight: '1024',
    icon: '/food-og.png',
  },
  admin: {
    title: 'Administración — Mesa abierta',
    description: 'Administración segura del pedido semanal del equipo.',
    theme: '#f7f1e7',
    siteName: 'Mesa abierta',
    image: '/food-og.png',
    imageWidth: '1536',
    imageHeight: '1024',
    icon: '/food-og.png',
  },
  options: {
    title: 'Restaurantes — Mesa abierta',
    description: 'Consulta los restaurantes disponibles, descubre su propuesta y abre su carta en Uber Eats.',
    theme: '#f7f1e7',
    siteName: 'Mesa abierta',
    image: '/food-og.png',
    imageWidth: '1536',
    imageHeight: '1024',
    icon: '/food-og.png',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    theme: '#f7f1e7',
    siteName: 'chanuar.com',
    icon: '/food-og.png',
  },
};

function upsertMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function usePageEnvironment(page) {
  useEffect(() => {
    const meta = META[page];
    document.body.className = page === 'skinfolio' ? 'skinfolio-page' : page === 'notFound' ? 'not-found-page' : 'food-page';
    document.documentElement.lang = 'es';
    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: 'description' }, meta.description);
    upsertMeta('meta[name="theme-color"]', { name: 'theme-color' }, meta.theme);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, meta.title);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, meta.description);
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, meta.siteName);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, window.location.href);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, meta.title);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, meta.description);
    const image = meta.image ? new URL(meta.image, window.location.origin).href : '';
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, image);
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width' }, meta.imageWidth ?? '');
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height' }, meta.imageHeight ?? '');
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, image);
    const icon = document.head.querySelector('link[rel="icon"]');
    if (icon) {
      icon.href = meta.icon;
      icon.type = meta.icon.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    }

    if (page === 'skinfolio') {
      for (const href of ['/fonts/beaufort-bold.woff2', '/fonts/spiegel-regular.woff2']) {
        if (!document.head.querySelector(`link[data-skinfolio-font="${href}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preload'; link.as = 'font'; link.type = 'font/woff2'; link.crossOrigin = 'anonymous';
          link.href = href; link.dataset.skinfolioFont = href;
          document.head.appendChild(link);
        }
      }
    }
  }, [page]);
}

function RouteLoading() {
  return <div className="route-loading" role="status" aria-live="polite">Cargando…</div>;
}

function NotFound() {
  usePageEnvironment('notFound');
  return <main className="not-found"><p>404</p><h1>Esta mesa no está aquí</h1><span>Puede que la dirección haya cambiado o no exista.</span><a href="/">Volver al inicio</a></main>;
}

function RoutedPage({ page, children }) {
  usePageEnvironment(page);
  return children;
}

export default function AppRouter() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return <RoutedPage page="skinfolio"><App /></RoutedPage>;
  if (path === '/food') return <RoutedPage page="food"><Suspense fallback={<RouteLoading />}><FoodApp /></Suspense></RoutedPage>;
  if (path === '/food/options') return <RoutedPage page="options"><Suspense fallback={<RouteLoading />}><OptionsApp /></Suspense></RoutedPage>;
  if (path === '/food/admin') return <RoutedPage page="admin"><Suspense fallback={<RouteLoading />}><AdminApp /></Suspense></RoutedPage>;
  return <NotFound />;
}

export { META, usePageEnvironment };
