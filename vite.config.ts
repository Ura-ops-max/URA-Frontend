import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: true,
      port: Number(env.PORT) || 5173,
      strictPort: false,
      allowedHosts: ['ura-v2-dnbs.onrender.com'],
      proxy: {
        '/payluk-api': {
          target: 'https://staging.api.payluk.ng',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/payluk-api/, '/v1'),
        },
      },
    },

    preview: {
      host: true,
      port: Number(env.PORT) || 4173,
      strictPort: false,
    },
  };
});
