/** @type {import('tailwindcss').Config} */
// 水色×ミニマル。配色・角丸は tokens.css の CSS 変数を参照し、
// テーマ切替や微調整を CSS 側だけで完結できるようにする。
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        accent: 'var(--color-accent)',
        'accent-weak': 'var(--color-accent-weak)',
        text: 'var(--color-text)',
        'text-weak': 'var(--color-text-weak)',
        line: 'var(--color-line)',
      },
      borderRadius: { card: 'var(--radius)' },
      spacing: { gutter: 'var(--space)' },
      maxWidth: { app: '480px' }, // モバイル縦画面ファースト
    },
  },
  plugins: [],
};
