// 1ブロックの拡大編集（中央ラベル＋周囲8マスをマンダラ配置で）。
import type { OpenWindow64 } from '../../../domain/types';
import { CELL_LAYOUT } from './openWindow64';

type Block = OpenWindow64['blocks'][number];

interface BlockEditorProps {
  block: Block;
  isCenter: boolean; // blocks[0]（中央ブロック）か
  positionLabel: string; // 例: 中央 / 真上 / 右上 …
  onChangeCenter: (value: string) => void;
  onChangeCell: (cellIndex: number, value: string) => void;
  onBack: () => void;
}

const cellClass =
  'h-full w-full resize-none rounded-card border border-line bg-surface p-1.5 text-center text-xs leading-tight outline-none focus:border-accent';

export function BlockEditor({
  block,
  isCenter,
  positionLabel,
  onChangeCenter,
  onChangeCell,
  onBack,
}: BlockEditorProps) {
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-bg">
      <div
        className="mx-auto max-w-app px-gutter pb-24"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + var(--space))' }}
      >
        <header className="mb-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="戻る"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-text-weak active:bg-accent-weak"
          >
            ‹
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {isCenter ? 'CENTER' : positionLabel}
            </p>
            <h1 className="text-xl font-bold text-text">
              {isCenter ? '中央ブロック' : `ブロック（${positionLabel}）`}
            </h1>
          </div>
        </header>

        <p className="mb-3 text-sm text-text-weak">
          {isCenter
            ? '中央にテーマ、周囲8マスに8ジャンルを記入します。'
            : '中央にジャンル、周囲8マスに真上から時計回りで目標を記入します。'}
        </p>

        <div className="grid grid-cols-3 gap-1.5">
          {CELL_LAYOUT.map((slot, i) => {
            if (slot === -1) {
              // 中央＝ブロックのラベル
              return (
                <textarea
                  key={`center-${i}`}
                  value={block.center}
                  placeholder={isCenter ? 'テーマ' : 'ジャンル'}
                  onChange={(e) => onChangeCenter(e.target.value)}
                  className={`${cellClass} aspect-square border-accent bg-accent-weak font-semibold`}
                />
              );
            }
            return (
              <textarea
                key={`cell-${slot}`}
                value={block.cells[slot] ?? ''}
                onChange={(e) => onChangeCell(slot, e.target.value)}
                className={`${cellClass} aspect-square`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
