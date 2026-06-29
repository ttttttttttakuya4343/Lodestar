// ルーティンチェック（○/×）。アクティブルーティンを一覧し、その日の done をトグル。
// Phase 1 の最小機能としてインラインでルーティン追加・削除もできる。
import { useState } from 'react';
import type { Routine } from '../../domain/types';

interface RoutineCheckListProps {
  routines: Routine[];
  isChecked: (routineId: string) => boolean;
  onToggle: (routineId: string) => void;
  onAddRoutine: (name: string) => void;
  onRemoveRoutine: (routineId: string) => void;
}

export function RoutineCheckList({
  routines,
  isChecked,
  onToggle,
  onAddRoutine,
  onRemoveRoutine,
}: RoutineCheckListProps) {
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    if (!draft.trim()) return;
    onAddRoutine(draft);
    setDraft('');
  };

  return (
    <div>
      {routines.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-3 text-sm text-text-weak">
          ルーティンがまだありません。下から追加すると毎日チェックできます。
        </p>
      ) : (
        <ul className="space-y-2">
          {routines.map((routine) => {
            const checked = isChecked(routine.id);
            return (
              <li key={routine.id} className="flex items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={`${routine.name} を${checked ? '未達成に' : '達成に'}する`}
                  onClick={() => onToggle(routine.id)}
                  className={`flex h-11 flex-1 items-center gap-3 rounded-card border px-3 text-left text-base transition-colors ${
                    checked
                      ? 'border-accent bg-accent-weak text-text'
                      : 'border-line bg-surface text-text'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                      checked
                        ? 'border-accent bg-accent text-white'
                        : 'border-line text-transparent'
                    }`}
                    aria-hidden
                  >
                    ○
                  </span>
                  <span className={checked ? 'font-semibold' : ''}>
                    {routine.name}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`ルーティン「${routine.name}」を削除`}
                  onClick={() => onRemoveRoutine(routine.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-weak active:bg-accent-weak"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-2 flex items-center gap-2">
        <input
          value={draft}
          placeholder="＋ ルーティンを追加"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitDraft();
            }
          }}
          className="min-w-0 flex-1 rounded-card border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={commitDraft}
          className="h-10 shrink-0 rounded-card bg-accent px-4 text-sm font-semibold text-white active:opacity-90"
        >
          追加
        </button>
      </div>
    </div>
  );
}
