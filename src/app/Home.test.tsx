import { cleanup, render, screen, within } from '@testing-library/react';
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
    expect(screen.getByRole('link', { name: '01 Proyectos' })).toHaveAttribute(
      'href',
      '/#proyectos',
    );
    expect(screen.getByRole('link', { name: '02 Stack' })).toHaveAttribute('href', '/#tecnologias');
    expect(screen.getByRole('link', { name: '03 Contacto' })).toHaveAttribute('href', '/#contacto');
    expect(screen.getByRole('link', { name: /Skinfolio/ })).toHaveAttribute('href', '/skinfolio');
    expect(screen.getByRole('link', { name: /MenuBox/ })).toHaveAttribute('href', '/food');
    const technologies = screen.getByRole('list', { name: 'Tecnologías que utilizo' });
    expect(within(technologies).getAllByRole('listitem')).toHaveLength(17);
    expect(technologies.querySelectorAll('img')).toHaveLength(17);
    expect(screen.queryByText('Herramientas con las que construyo')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Pausar/ })).toBeVisible();
  });

  it('uses the portfolio shell for unknown routes', () => {
    renderPage(NotFound);

    expect(screen.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Volver al portfolio' })).toHaveAttribute('href', '/');
    expect(document.querySelector('.portfolio-shell')).toBeInTheDocument();
  });
});
