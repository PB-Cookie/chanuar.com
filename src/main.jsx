import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter.jsx';
import './styles.css';
import './food/food.css';

const initialPath = window.location.pathname.replace(/\/+$/, '') || '/';
document.body.className = initialPath === '/'
  ? 'skinfolio-page'
  : initialPath === '/food' || initialPath === '/food/admin'
    ? 'food-page'
    : 'not-found-page';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
