import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from './ContactForm';

const { sendForm } = vi.hoisted(() => ({ sendForm: vi.fn() }));

vi.mock('@emailjs/browser', () => ({ default: { sendForm } }));

beforeEach(() => {
  sendForm.mockReset();
  vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'service_test');
  vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'template_test');
  vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'public_test');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function completeForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nombre'), 'Carlos Chanuar');
  await user.type(screen.getByLabelText('Email'), 'carlos@example.com');
  await user.type(screen.getByLabelText('Mensaje'), 'Quiero hablar sobre un proyecto.');
  return user;
}

describe('ContactForm', () => {
  it.each(['VITE_EMAILJS_SERVICE_ID', 'VITE_EMAILJS_TEMPLATE_ID', 'VITE_EMAILJS_PUBLIC_KEY'])(
    'disables sending when %s is missing',
    (key) => {
      vi.stubEnv(key, '');
      render(<ContactForm />);

      expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
      expect(sendForm).not.toHaveBeenCalled();
    },
  );

  it('sends the EmailJS form and confirms success', async () => {
    sendForm.mockResolvedValue({ status: 200, text: 'OK' });
    render(<ContactForm />);
    const user = await completeForm();

    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(sendForm).toHaveBeenCalledWith(
      'service_test',
      'template_test',
      expect.any(HTMLFormElement),
      { publicKey: 'public_test' },
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Mensaje enviado. Te responderé pronto.',
    );
    expect(screen.getByLabelText('Nombre')).toHaveValue('');
  });

  it('shows a retryable error when EmailJS rejects the request', async () => {
    sendForm.mockRejectedValue(new Error('network error'));
    render(<ContactForm />);
    const user = await completeForm();

    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo enviar. Inténtalo de nuevo o usa el email.',
    );
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeEnabled();
  });
});
