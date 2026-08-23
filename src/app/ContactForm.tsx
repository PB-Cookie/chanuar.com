import emailjs from '@emailjs/browser';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const isConfigured = Boolean(serviceId && templateId && publicKey);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfigured) return;

    const form = event.currentTarget;
    setStatus('sending');

    try {
      await emailjs.sendForm(serviceId, templateId, form, { publicKey });
      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form
      className="portfolio-contact-form"
      onSubmit={handleSubmit}
      onChange={() => status !== 'sending' && setStatus('idle')}
      aria-busy={status === 'sending'}
    >
      <fieldset disabled={status === 'sending'}>
        <div className="portfolio-contact-form__field">
          <label htmlFor="contact-name">{t('contactForm.name')}</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            required
          />
        </div>
        <div className="portfolio-contact-form__field">
          <label htmlFor="contact-email">{t('contactForm.email')}</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div className="portfolio-contact-form__field portfolio-contact-form__field--message">
          <label htmlFor="contact-message">{t('contactForm.message')}</label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            minLength={10}
            maxLength={2000}
            required
          />
        </div>
        <div className="portfolio-contact-form__actions">
          <div className="portfolio-contact-form__feedback" aria-live="polite">
            {!isConfigured && <p>{t('contactForm.unavailable')}</p>}
            {status === 'success' && <p role="status">{t('contactForm.success')}</p>}
            {status === 'error' && <p role="alert">{t('contactForm.error')}</p>}
          </div>
          <button type="submit" disabled={!isConfigured || status === 'sending'}>
            {status === 'sending' ? t('contactForm.sending') : t('contactForm.submit')}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </fieldset>
    </form>
  );
}
