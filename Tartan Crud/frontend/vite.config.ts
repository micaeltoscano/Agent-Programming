import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // necessário para Docker
    // Encaminha chamadas /api ao backend NestJS (evita CORS no dev).
    proxy: {
      '/api': process.env.API_URL || 'http://backend:3000',
    },
  },
});
