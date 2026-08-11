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
        lazy: async () => {
          const route = await import('../products/skinfolio/routes/SkinfolioRoute');
          return { Component: route.Component, loader: route.loader, ErrorBoundary: route.ErrorBoundary };
        },
      },
      {
        path: 'food',
        handle: { page: 'food' },
        lazy: async () => {
          const route = await import('../products/food/routes/FoodLayout');
          return { Component: route.Component, ErrorBoundary: route.ErrorBoundary };
        },
        children: [
          {
            index: true,
            lazy: async () => {
              const route = await import('../products/food/routes/OrderRoute');
              return { Component: route.Component, loader: route.loader };
            },
          },
          {
            path: 'options',
            handle: { page: 'options' },
            lazy: async () => {
              const route = await import('../products/food/routes/OptionsRoute');
              return { Component: route.Component, loader: route.loader };
            },
          },
          {
            path: 'admin',
            handle: { page: 'admin' },
            lazy: async () => {
              const route = await import('../products/food/routes/AdminRoute');
              return { Component: route.Component, loader: route.loader };
            },
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
