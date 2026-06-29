// 2フィールドのペアを並べて編集するリスト（マイルストーン[内容+期日]・ストローク[誰から+内容]用）。
import { useState } from 'react';

export interface Pair {
  first: string;
  second: string;
}

interface PairListEditorProps {
  items: Pair[];
  firstPlaceholder: string;
  secondPlaceholder: string;
  secondType?: 'text' | 'date';
  onAdd: (pair: Pair) => void;
  onUpdate: (index: number, pair: Pair) => void;
  onRemove: (index: number) => void;
}

export function PairListEditor({
  items,
  firstPlaceholder,
  secondPlaceholder,
  secondType = 'text',
  onAdd,
  onUpdate,
  onRemove,
}: PairListEditorProps) {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');

  const commit = () => {
    if (!first.trim() && !second.trim()) return;
    onAdd({ first: first.trim(), second: second.trim() });
    setFirst('');
    setSecond('');
  };

  const fieldClass =
    'min-w-0 rounded-card border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent';

  return (
    <div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <input
                value={item.first}
                placeholder={firstPlaceholder}
                onChange={(e) =>
                  onUpdate(i, { ...item, first: e.target.value })
                }
                className={fieldClass}
              />
              <input
                type={secondType}
                value={item.second}
                placeholder={secondPlaceholder}
                onChange={(e) =>
                  onUpdate(i, { ...item, second: e.target.value })
                }
                className={fieldClass}
              />
            </div>
            <button
              type="button"
              aria-label="削除"
              onClick={() => onRemove(i)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-weak active:bg-accent-weak"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-end gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input
            value={first}
            placeholder={firstPlaceholder}
            onChange={(e) => setFirst(e.target.value)}
            className={fieldClass}
          />
          <input
            type={secondType}
            value={second}
            placeholder={secondPlaceholder}
            onChange={(e) => setSecond(e.target.value)}
            className={fieldClass}
          />
        </div>
        <button
          type="button"
          onClick={commit}
          className="h-10 shrink-0 rounded-card bg-accent px-4 text-sm font-semibold text-white active:opacity-90"
        >
          追加
        </button>
      </div>
    </div>
  );
}
