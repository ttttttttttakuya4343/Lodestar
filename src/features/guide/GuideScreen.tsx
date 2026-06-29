// 使い方ガイド（「使い方」タブの画面）。読み物として常設。
import type { ReactNode } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { GUIDE_BLOCKS, GUIDE_TITLE, type GuideBlock } from './guideContent';

// タイトルの「— あとに続くキャッチ」をリード文として使う。
const TAGLINE = GUIDE_TITLE.split('—')[1]?.trim() ?? '';

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

export function GuideScreen() {
  return (
    <ScreenScaffold eyebrow="GUIDE" title="使い方ガイド">
      {TAGLINE && <p className="-mt-3 mb-4 text-sm text-text-weak">{TAGLINE}</p>}

      <article>
        {GUIDE_BLOCKS.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </article>
    </ScreenScaffold>
  );
}
