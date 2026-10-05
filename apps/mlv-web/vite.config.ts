import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { normalizeViteBasePath } from '../../scripts/vite-base-path.mjs';

// Cloudflare production/previews and local dev use `/`.
// GitHub Pages sets VITE_BASE_PATH=/3k-mlv/.
const base = normalizeViteBasePath(process.env.VITE_BASE_PATH);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        start_url: base,
        scope: base,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm,glb}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:glb|gltf|wasm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: '3d-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@3k-mlv/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@3k-mlv/shared/networkTwin': path.resolve(__dirname, '../../packages/shared/src/networkTwin/web.js'),
      '@3k-mlv/campus': path.resolve(__dirname, '../../packages/shared/src/campus/index.js'),
    },
  },
  cacheDir: path.resolve(__dirname, '../../.vite-spatial'),
  base,
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/@react-three')) return 'react-three';
          if (id.includes('node_modules/@supabase')) return 'supabase';
          if (id.includes('/src/campus/') || id.includes('/src/three/CampusWorld')) return 'campus';
          if (id.includes('/campus/catalog.js') || id.includes('/campus/model.js')) return 'campus-source';
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  },
  server: {
    port: 3001,
    host: true,
    fs: {
      allow: [path.resolve(__dirname, '../..')],
    },
  },
  preview: {
    port: 4174,
    host: true
  }
});
