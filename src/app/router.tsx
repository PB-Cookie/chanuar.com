import { createBrowserRouter, type RouteObject } from 'react-router';
import { NotFound } from './NotFound';
import { RouteEnvironment } from './RouteEnvironment';

export const routes: RouteObject[] = [
  {
    Component: RouteEnvironment,
    children: [
      {
        index: true,
        handle: { page: 'skinfolio' },
        lazy: () => import('../products/skinfolio/routes/SkinfolioRoute'),
      },
      {
        path: 'food',
        handle: { page: 'food' },
        lazy: () => import('../products/food/routes/FoodLayout'),
        children: [
          {
            index: true,
            lazy: () => import('../products/food/routes/OrderRoute'),
          },
          {
            path: 'options',
            handle: { page: 'options' },
            lazy: () => import('../products/food/routes/OptionsRoute'),
          },
          {
            path: 'admin',
            handle: { page: 'admin' },
            lazy: () => import('../products/food/routes/AdminRoute'),
          },
        ],
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
