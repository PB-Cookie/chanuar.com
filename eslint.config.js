import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/products/skinfolio/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../food/**', '../../food/**', '../../../food/**', '**/products/food/**', '../../app/**', '../../../app/**', '**/app/**'] }],
    },
  },
  {
    files: ['src/products/food/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../skinfolio/**', '../../skinfolio/**', '../../../skinfolio/**', '**/products/skinfolio/**', '../../app/**', '../../../app/**', '**/app/**'] }],
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: { globals: { process: 'readonly' } },
  },
);
