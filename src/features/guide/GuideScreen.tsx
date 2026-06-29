// 使い方ガイド（全画面の読み物オーバーレイ）。初回起動時の自動表示と設定からの表示で共用。
import { useState } from 'react';
import type { ReactNode } from 'react';
import { GUIDE_BLOCKS, GUIDE_TITLE, type GuideBlock } from './guideContent';
import { isGuideDismissed, setGuideDismissed } from './guide';

interface GuideScreenProps {
  onClose: () => void;
}

// `**強調**` を太字に変換してインライン描画する。
function renderInline(text: string): ReactNode[] {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-text">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="mb-2 mt-7 text-lg font-bold text-text">{block.text}</h2>
      );
    case 'h3':
      return (
        <h3 className="mb-1.5 mt-5 text-base font-semibold text-accent-strong">
          {block.text}
        </h3>
      );
    case 'p':
      return (
        <p className="mb-3 text-[15px] leading-7 text-text">
          {renderInline(block.text)}
        </p>
      );
    case 'ul':
      return (
        <ul className="mb-3 space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[15px] leading-7 text-text">
              <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
                •
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
  }
}

export function GuideScreen({ onClose }: GuideScreenProps) {
  const [dismissed, setDismissed] = useState(() => isGuideDismissed());

  const toggleDismissed = (next: boolean) => {
    setDismissed(next);
    setGuideDismissed(next);
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-bg">
      <div
        className="mx-auto max-w-app px-gutter pb-24"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + var(--space))' }}
      >
        <header className="mb-5 flex items-start gap-2">
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-text-weak active:bg-accent-weak"
          >
            ‹
          </button>
          <div>
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-accent">
              <span aria-hidden>✦</span>
              GUIDE
            </p>
            <h1 className="mt-1 text-xl font-bold text-text">{GUIDE_TITLE}</h1>
          </div>
        </header>

        <article>
          {GUIDE_BLOCKS.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </article>

        <div className="mt-8 border-t border-line pt-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={dismissed}
              onChange={(e) => toggleDismissed(e.target.checked)}
              className="h-5 w-5 accent-accent"
            />
            <span className="text-sm text-text-weak">
              次回から起動時に表示しない
            </span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 h-11 w-full rounded-card bg-accent text-sm font-semibold text-white active:opacity-90"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
