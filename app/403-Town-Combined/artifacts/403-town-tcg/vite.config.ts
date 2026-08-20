import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  build: {
    outDir: path.resolve(rootDir, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT || 5173),
    host: '0.0.0.0',
  },
  preview: {
    port: Number(process.env.PORT || 4173),
    host: '0.0.0.0',
  },
});
