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
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
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
    files: ['src/products/**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['vite.config.js'],
    languageOptions: { globals: { process: 'readonly' } },
  },
);
