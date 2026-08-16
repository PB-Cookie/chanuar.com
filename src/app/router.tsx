import { createBrowserRouter, type RouteObject } from 'react-router';
import { Home } from './Home';
import { NotFound } from './NotFound';
import { RouteEnvironment, type Page } from './RouteEnvironment';

export const routes: RouteObject[] = [
  {
    Component: RouteEnvironment,
    children: [
      {
        index: true,
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
];

export const router = createBrowserRouter(routes);
