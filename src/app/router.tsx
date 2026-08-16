import { createBrowserRouter, type RouteObject } from 'react-router';
import { Home } from './Home';
import { NotFound } from './NotFound';
import { RouteEnvironment } from './RouteEnvironment';

export const routes: RouteObject[] = [
  {
    Component: RouteEnvironment,
    children: [
      {
        index: true,
        handle: { page: 'home' },
        Component: Home,
      },
      {
        path: '*',
        handle: { page: 'notFound' },
        Component: NotFound,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
