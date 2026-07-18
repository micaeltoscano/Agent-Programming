import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Encaminha chamadas /api ao backend NestJS (evita CORS no dev).
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
