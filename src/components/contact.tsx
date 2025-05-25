import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
} from '../config/env';
import { useTranslation } from 'react-i18next';
const Contact = () => {
  const { t } = useTranslation(['portfolio', 'common']);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const sendEmail = (e: any) => {
    console.log(EMAILJS_PUBLIC_KEY);
    console.log(EMAILJS_SERVICE_ID);
    console.log(EMAILJS_TEMPLATE_ID);
    e.preventDefault();
    if (formRef.current) {
      emailjs
        .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, {
          publicKey: EMAILJS_PUBLIC_KEY,
        })
        .then(
          () => {
            setSubmitted(true);
          },
          (error) => {
            console.log(error.text);
          }
        );
    } else {
      console.error('Form reference is null');
    }
  };
  return (
    <section
      id='contact'
      style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}
    >
      {submitted ? (
        <p>{t('portfolio:contactForm.msgSent')}</p>
      ) : (
        <motion.form
          onSubmit={sendEmail}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          ref={formRef}
        >
          <div style={{ marginBottom: '1rem' }}>
            <input
              type='text'
              placeholder={t('portfolio:contactForm.name')}
              name='name'
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type='email'
              placeholder={t('portfolio:contactForm.email')}
              name='email'
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              rows={8}
              placeholder={t('portfolio:contactForm.message')}
              name='message'
            />
          </div>
          <button type='submit'>{t('common:common.send')}</button>
        </motion.form>
      )}
    </section>
  );
};

export default Contact;
