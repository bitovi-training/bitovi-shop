import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '..', 'shared'),
    },
  },
  server: {
    port: 5173,
    // Codespaces forwards ports on *.app.github.dev. Without this, Vite's host
    // check can refuse the shared prototype URL.
    allowedHosts: ['.app.github.dev'],
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src', 'test', 'setup.js')],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
  },
});