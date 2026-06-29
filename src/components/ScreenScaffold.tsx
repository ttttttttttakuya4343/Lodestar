// 各タブ画面の共通レイアウト。元手帳の雰囲気（英字の大きな見出し）を軽く参照。
import type { ReactNode } from 'react';

interface ScreenScaffoldProps {
  eyebrow: string; // 英字の小見出し（例: TODAY）
  title: string; // 日本語タイトル
  headerAction?: ReactNode; // 見出し右の操作（検索ボタン等）
  children?: ReactNode;
}

export function ScreenScaffold({
  eyebrow,
  title,
  headerAction,
  children,
}: ScreenScaffoldProps) {
  return (
    <section
      className="mx-auto max-w-app px-gutter pb-24"
      // ノッチ端末でも見出しが隠れないようセーフエリア分を上に確保
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + var(--space))' }}
    >
      <header className="mb-6 flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-accent">
            <span aria-hidden>✦</span>
            {eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-text">{title}</h1>
        </div>
        {headerAction}
      </header>
      {children ?? (
        <div className="rounded-card border border-line bg-surface p-gutter text-text-weak">
          このタブは Phase 1 以降で実装します。
        </div>
      )}
    </section>
  );
}
