import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
} from '../config/env';
const Contact = () => {
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
          (result) => {
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
      <h2>Contáctame</h2>
      {submitted ? (
        <p>¡Gracias por tu mensaje! Te responderé pronto.</p>
      ) : (
        <motion.form
          onSubmit={sendEmail}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          ref={formRef}
        >
          <div style={{ marginBottom: '1rem' }}>
            <input type='text' placeholder='name' name='name' required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input type='email' placeholder='email' name='email' required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <textarea rows={8} placeholder='Message' name='message' />
          </div>
          <button type='submit'>Enviar</button>
        </motion.form>
      )}
    </section>
  );
};

export default Contact;
