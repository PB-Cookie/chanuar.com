import portfolioEs from '../src/lang/es/portfolio.json';
import commonEs from '../src/lang/es/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'portfolio';
    resources: {
      portfolio: typeof portfolioEs;
      common: typeof commonEs;
    };
  }
}
