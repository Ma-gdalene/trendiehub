import path from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT || '3000';
const port = Number(rawPort) || 3000;
const basePath = process.env.BASE_PATH || '/';

function generateSpaRoutes() {
  const routes = [
    'dashboard',
    'profile',
    'tasks',
    'models',
    'applications',
    'points',
    'leaderboard',
    'messages',
    'announcements',
    'daily-tracker',
    'support',
    'settings',
    'notifications',
    'sign-in',
    'sign-up',
    'reset-password',
    'forgot-password',
  ];
  return {
    name: 'generate-spa-routes',
    closeBundle() {
      const outDir = path.resolve(import.meta.dirname, 'dist/public');
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      fs.writeFileSync(path.join(outDir, '404.html'), indexContent);

      for (const route of routes) {
        fs.writeFileSync(path.join(outDir, `${route}.html`), indexContent);
        const routeDir = path.join(outDir, route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), indexContent);
      }
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    generateSpaRoutes(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
