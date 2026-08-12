import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite. Le site reste en JS vanilla ; React n'est utilisé
// que pour des "îlots" (composants react-bits montés dans des zones
// précises du DOM). Le plugin React active le JSX/Fast Refresh.
export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
