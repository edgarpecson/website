import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Optional: embed fallback for VITE_API_URL during build (Render workaround)
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:8000'
    ),
  },

  // Optional: local dev proxy to avoid CORS issues when testing locally
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ec2-status': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/start-ec2': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/stop-ec2': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/console': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});