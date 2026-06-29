import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// PWA: manifest + Service Worker を自動生成。オフライン起動・ホーム画面追加に対応。
// アプリ名は「Lodestar」（manifest.name / 表示名に使用）。
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 開発時も SW を有効化してインストール可否を確認できるようにする
      devOptions: { enabled: true },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lodestar',
        short_name: 'Lodestar',
        description: '原田メソッド STAR PLANNER をデジタル化する個人専用の目標達成ノート',
        lang: 'ja',
        theme_color: '#5cc6e8',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // SPA: ナビゲーションは index.html へフォールバック（オフライン起動）
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
});
