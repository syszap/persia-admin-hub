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
        // The offline fallback document is served when navigation requests fail.
        // It must be pre-cached so it's available with zero connectivity.
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/(api|auth))/],

        // Pre-cache the app shell (handled automatically by Workbox for all
        // assets emitted by Vite); runtimeCaching covers dynamic API responses.
        runtimeCaching: [
          // ── Static assets: cache-first (fonts, images) ────────────────────
          {
            urlPattern: /\.(?:woff2?|ttf|otf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },

          // ── Summary/reference endpoints: stale-while-revalidate ───────────
          // User sees stale data instantly; fresh data updates in the background.
          {
            urlPattern: /^\/api\/returned-cheques\/summary/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-summary-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 5 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/feature-flags/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-flags-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 30 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Auth endpoints: network-only (never cache credentials) ─────────
          {
            urlPattern: /^\/api\/auth\//,
            handler: 'NetworkOnly',
          },

          // ── All other API calls: network-first with 10s timeout ───────────
          // Falls back to cache so the app remains usable offline.
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@tanstack/react-query',
      '@tanstack/query-core',
    ],
  },

  build: {
    // Warn when a chunk exceeds 500 kB (gzip)
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Core React runtime — always first paint
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react';
          }
          // Data layer — loaded after core
          if (id.includes('@tanstack/react-query') || id.includes('@tanstack/query-core')) {
            return 'vendor-query';
          }
          // State management
          if (id.includes('zustand')) {
            return 'vendor-state';
          }
          // Form & validation — not needed on first paint
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'vendor-form';
          }
          // Charts — heavy, lazy-loaded pages only
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
          // Radix UI — split from other UI libs
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
}));
