import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: (() => {
    const proxyTarget = process.env.VITE_API_PROXY_TARGET;
    if (!proxyTarget) return {};
    return {
      proxy: {
        // Proxy API requests to backend during development when VITE_API_PROXY_TARGET is set
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    };
  })(),
});
