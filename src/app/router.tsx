import { createBrowserRouter, type RouteObject } from 'react-router';
import { Home } from './Home';
import { NotFound } from './NotFound';
import { PortfolioShell } from './PortfolioShell';
import { RouteEnvironment, type Page } from './RouteEnvironment';
import { RouteError } from './RouteError';

export const routes: RouteObject[] = [
  {
    Component: RouteEnvironment,
    ErrorBoundary: RouteError,
    children: [
      {
        Component: PortfolioShell,
        children: [
          {
            index: true,
            handle: 'home' satisfies Page,
            Component: Home,
          },
          {
            path: 'en',
            handle: 'home' satisfies Page,
            Component: Home,
          },
          {
            path: '*',
            handle: 'notFound' satisfies Page,
            Component: NotFound,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
