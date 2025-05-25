import portfolioEs from '../src/lang/es/portfolio.json';
import portfolioEn from '../src/lang/en/portfolio.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'portfolio';
    resources: {
      portfolio: typeof portfolioEs;
    };
  }
}
