import { defineConfig } from 'vite';

// Configuration Vite minimale. La racine contient index.html.
export default defineConfig({
  root: '.',
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
