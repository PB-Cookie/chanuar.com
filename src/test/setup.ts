import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import i18n from '../app/i18n';

if (typeof window !== 'undefined') {
  window.matchMedia = (query) =>
    Object.assign(new EventTarget(), {
      matches: false,
      media: query,
      onchange: null,
    }) as MediaQueryList;
}

beforeEach(async () => {
  await i18n.changeLanguage('es');
});

afterEach(cleanup);
