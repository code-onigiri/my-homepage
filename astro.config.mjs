// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import alpinejs from '@astrojs/alpinejs';

import icon from 'astro-icon';

import cloudflare from '@astrojs/cloudflare';

import markdoc from '@astrojs/markdoc';

import react from '@astrojs/react';

import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['astro-icon']
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  },

  integrations: [alpinejs(), icon(), markdoc(), react(), keystatic()],

  // Keystatic の /keystatic と /api/keystatic は SSR ルートとして動作
  // 既存ページには export const prerender = true を設定して静的出力を維持
  output: 'server',

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  adapter: cloudflare()
});