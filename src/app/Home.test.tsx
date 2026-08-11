import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Home } from './Home';
import { NotFound } from './NotFound';

afterEach(cleanup);

function renderPage(Component: typeof Home) {
  const router = createMemoryRouter([{ path: '*', Component }]);
  render(<RouterProvider router={router} />);
}

describe('portfolio surfaces', () => {
  it('presents the owner, contact links, and both projects', () => {
    renderPage(Home);

    expect(screen.getByRole('heading', { name: 'Carlos Alberto Chanuar Martínez' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/chanuar',
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/carlos-chanuar-mart%C3%ADnez-591653251/',
    );
    expect(screen.getByRole('navigation', { name: 'Perfiles y contacto' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Skinfolio/ })).toHaveAttribute('href', '/skinfolio');
    expect(screen.getByRole('link', { name: /Mesa abierta/ })).toHaveAttribute('href', '/food');
  });

  it('uses the portfolio shell for unknown routes', () => {
    renderPage(NotFound);

    expect(screen.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Volver al portfolio' })).toHaveAttribute('href', '/');
    expect(document.querySelector('.portfolio-shell')).toBeInTheDocument();
  });
});
