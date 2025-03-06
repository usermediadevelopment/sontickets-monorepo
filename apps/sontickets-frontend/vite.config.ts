import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    sentryVitePlugin({
      org: 'sontickets',
      project: 'dashboard-react',
    }),
  ],

  esbuild: {
    target: 'es2020',
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },

  build: {
    sourcemap: true,
  },
});
