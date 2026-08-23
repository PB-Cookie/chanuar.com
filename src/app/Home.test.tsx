import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from './router';

function renderPage(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe('portfolio surfaces', () => {
  it('presents the owner, contact links, and both projects', () => {
    renderPage('/');

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
    expect(screen.getByRole('link', { name: /Skinfolio/ })).toHaveAttribute(
      'href',
      'https://skinfolio.chanuar.com',
    );
    expect(screen.getByRole('link', { name: /MenuBox/ })).toHaveAttribute(
      'href',
      'https://menubox.chanuar.com',
    );
    expect(screen.getByText(/normaliza más de 2\.500 skins/)).toBeVisible();
    expect(screen.getByText(/horarios públicos de 14 restaurantes/)).toBeVisible();
    const technologies = screen.getByRole('list', { name: 'Tecnologías que utilizo' });
    expect(within(technologies).getAllByRole('listitem')).toHaveLength(17);
    expect(technologies.querySelectorAll('img')).toHaveLength(17);
    expect(screen.getByRole('checkbox', { name: /Pausar/ })).toBeVisible();
  });

  it('uses the portfolio shell for unknown routes', () => {
    renderPage('/missing');

    expect(screen.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Volver al portfolio' })).toHaveAttribute('href', '/');
    expect(document.querySelector('.portfolio-shell')).toBeInTheDocument();
  });

  it('switches the interface and metadata to English', async () => {
    const user = userEvent.setup();
    renderPage('/');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en');

    expect(screen.getByText('Full-stack developer')).toBeVisible();
    expect(screen.getByRole('link', { name: '01 Projects' })).toBeVisible();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute(
      'content',
      'en_US',
    );
  });
});
