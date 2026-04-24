import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    hmr: { overlay: false },
    proxy: { '/api': 'http://localhost:3001' },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'پنل مدیریت شیما',
        short_name: 'شیما',
        description: 'سامانه مدیریت یکپارچه شیما',
        theme_color: '#2da858',
        background_color: '#f0f5f8',
        display: 'standalone',
        start_url: '/',
        dir: 'rtl',
        lang: 'fa',
        icons: [
          { src: '/favicon.ico', sizes: '64x64 32x32 24x24 16x16', type: 'image/x-icon' },
        ],
      },
      workbox: {
        // Cache API responses for offline support
        runtimeCaching: [
          {
            urlPattern: /^\/api\/returned-cheques\/summary/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-summary-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', '@tanstack/react-query', '@tanstack/query-core'],
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunking for optimal code splitting
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
}));
