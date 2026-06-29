// オープンウィンドウ64 エディタ。タイトル・スターゾーン・3×3ブロック一覧。
// ブロックをタップすると BlockEditor（拡大編集）へ。自動保存。
import { useState } from 'react';
import { ScreenScaffold } from '../../../components/ScreenScaffold';
import { Section } from '../../../components/Section';
import { TagListEditor } from '../../../components/TagListEditor';
import { pushTrimmed, removeAt, setAt } from '../../../lib/arrayOps';
import { dataStore } from '../../../data';
import { useKeyedRecord } from '../../../lib/useKeyedRecord';
import { useEmotionWords } from '../../emotions/useEmotionWords';
import { BlockEditor } from './BlockEditor';
import { BLOCK_LAYOUT, emptyOpenWindow64 } from './openWindow64';

interface OpenWindow64EditorProps {
  id: string;
  onClose: () => void;
}

// useKeyedRecord のフォールバック（実際はハブが作成済みなので呼ばれない）。
const makeEmptyFallback = (id: string) => emptyOpenWindow64(id, 'future');

// 外周ブロックの位置ラベル（data index 1..8 = 真上から時計回り）。
const POSITION_LABELS: Record<number, string> = {
  0: '中央',
  1: '真上',
  2: '右上',
  3: '右',
  4: '右下',
  5: '真下',
  6: '左下',
  7: '左',
  8: '左上',
};

export function OpenWindow64Editor({ id, onClose }: OpenWindow64EditorProps) {
  const { record, loading, apply } = useKeyedRecord(
    dataStore.openWindow64,
    id,
    makeEmptyFallback,
  );
  const [blockIndex, setBlockIndex] = useState<number | null>(null);
  const { labels: emotionLabels } = useEmotionWords();

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-bg">
      <ScreenScaffold
        eyebrow="OPEN WINDOW 64"
        title="オープンウィンドウ64"
      >
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-1 text-sm font-semibold text-accent active:opacity-80"
        >
          ‹ 一覧へ戻る
        </button>

        {loading || !record ? (
          <p className="text-text-weak">読み込み中…</p>
        ) : (
          <>
            <Section title="タイトル">
              <input
                value={record.title}
                placeholder={
                  record.type === 'future'
                    ? '例: 自分の未来'
                    : '例: 1年後に達成したい目標'
                }
                onChange={(e) => apply((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-card border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-text-weak">
                {record.type === 'future' ? '未来思考編' : '実践思考編'}
              </p>
            </Section>

            <Section title="スターゾーン（夢の実現で得られる感情）">
              <TagListEditor
                tags={record.star}
                placeholder="感情の言葉を追加"
                suggestions={emotionLabels}
                onAdd={(t) =>
                  apply((p) => ({ ...p, star: pushTrimmed(p.star, t) }))
                }
                onRemove={(i) =>
                  apply((p) => ({ ...p, star: removeAt(p.star, i) }))
                }
              />
            </Section>

            <Section title="64マス（ブロックをタップして編集）">
              <div className="grid grid-cols-3 gap-1.5">
                {BLOCK_LAYOUT.map((bi) => {
                  const block = record.blocks[bi];
                  const filled =
                    block?.cells.filter((c) => c.trim() !== '').length ?? 0;
                  const isCenter = bi === 0;
                  return (
                    <button
                      key={bi}
                      type="button"
                      onClick={() => setBlockIndex(bi)}
                      className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-card border p-1 text-center active:bg-accent-weak ${
                        isCenter
                          ? 'border-accent bg-accent-weak'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <span className="line-clamp-2 text-xs font-semibold text-text">
                        {block?.center.trim() ||
                          (isCenter ? '中央' : POSITION_LABELS[bi])}
                      </span>
                      <span className="text-[10px] text-text-weak">{filled}/8</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          </>
        )}
      </ScreenScaffold>

      {record && blockIndex !== null && record.blocks[blockIndex] && (
        <BlockEditor
          block={record.blocks[blockIndex]}
          isCenter={blockIndex === 0}
          positionLabel={POSITION_LABELS[blockIndex] ?? ''}
          onChangeCenter={(value) =>
            apply((p) => ({
              ...p,
              blocks: p.blocks.map((b, i) =>
                i === blockIndex ? { ...b, center: value } : b,
              ),
            }))
          }
          onChangeCell={(cellIndex, value) =>
            apply((p) => ({
              ...p,
              blocks: p.blocks.map((b, i) =>
                i === blockIndex ? { ...b, cells: setAt(b.cells, cellIndex, value) } : b,
              ),
            }))
          }
          onBack={() => setBlockIndex(null)}
        />
      )}
    </div>
  );
}
