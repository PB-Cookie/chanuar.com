import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        notFound: resolve(process.cwd(), '404.html'),
        skinfolio: resolve(process.cwd(), 'skinfolio/index.html'),
        food: resolve(process.cwd(), 'food/index.html'),
        foodOptions: resolve(process.cwd(), 'food/options/index.html'),
        foodAdmin: resolve(process.cwd(), 'food/admin/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
