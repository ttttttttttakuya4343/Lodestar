// ルーティン管理オーバーレイ: 習慣化状況（連続/累計）・21日お祝い・アーカイブ・履歴。
// Today 画面から開く。active/archived と操作は親（Today）の useRoutines から受け取り、
// 連続/累計の統計はこの画面で useRoutineStats を使って算出する。
import { useState } from 'react';
import type { Routine } from '../../domain/types';
import { parseDateKey } from '../../domain/ids';
import { HABITUATION_DAYS, type RoutineStats } from './streak';
import { useRoutineStats } from './useRoutineStats';

interface RoutineManagerScreenProps {
  routines: Routine[]; // active
  archived: Routine[];
  onAdd: (name: string) => void;
  onArchive: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-text-weak">
      {label} <span className="font-semibold text-text">{value}</span>
    </span>
  );
}

function ActiveRow({
  routine,
  stats,
  onArchive,
  onRemove,
}: {
  routine: Routine;
  stats: RoutineStats;
  onArchive: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="rounded-card border border-line bg-bg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text">
            {routine.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatPill label="連続" value={`${stats.current}日`} />
            <StatPill label="累計" value={`${stats.total}日`} />
          </div>
        </div>
        <button
          type="button"
          aria-label={`ルーティン「${routine.name}」を削除`}
          onClick={() => onRemove(routine.id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-weak active:bg-accent-weak"
        >
          ×
        </button>
      </div>

      {stats.habituated ? (
        <div className="mt-3 rounded-card bg-accent-weak p-3">
          <p className="text-sm font-semibold text-text">
            🎉 {HABITUATION_DAYS}日達成・習慣化しました！
          </p>
          <p className="mt-0.5 text-xs text-text-weak">
            リストから外して、新しいルーティンに挑戦しましょう。
          </p>
          <button
            type="button"
            onClick={() => onArchive(routine.id)}
            className="mt-2 h-9 rounded-card bg-accent px-4 text-sm font-semibold text-white active:opacity-90"
          >
            アーカイブして次へ
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${Math.min(100, (stats.current / HABITUATION_DAYS) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-text-weak">
            習慣化まであと {Math.max(0, HABITUATION_DAYS - stats.current)} 日
          </p>
        </div>
      )}
    </li>
  );
}

export function RoutineManagerScreen({
  routines,
  archived,
  onAdd,
  onArchive,
  onRemove,
  onClose,
}: RoutineManagerScreenProps) {
  const { statsFor } = useRoutineStats();
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-bg">
      <div className="mx-auto max-w-app px-gutter pb-24 pt-gutter">
        <header className="mb-6 flex items-center gap-2">
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-text-weak active:bg-accent-weak"
          >
            ‹
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              ROUTINES
            </p>
            <h1 className="text-2xl font-bold text-text">ルーティン管理</h1>
          </div>
        </header>

        <section className="mb-7">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-weak">
            継続中
          </h2>
          {routines.length === 0 ? (
            <p className="rounded-card border border-line bg-surface p-3 text-sm text-text-weak">
              継続中のルーティンはありません。
            </p>
          ) : (
            <ul className="space-y-3">
              {routines.map((r) => (
                <ActiveRow
                  key={r.id}
                  routine={r}
                  stats={statsFor(r.id)}
                  onArchive={onArchive}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center gap-2">
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
        </section>

        {archived.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-weak">
              習慣化した実績
            </h2>
            <ul className="space-y-2">
              {archived.map((r) => {
                const stats = statsFor(r.id);
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-card border border-line bg-surface px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-base text-text">
                      🏅 {r.name}
                    </span>
                    <span className="shrink-0 text-xs text-text-weak">
                      累計{stats.total}日
                      {r.archivedAt
                        ? ` ・ ${parseDateKey(r.archivedAt.slice(0, 10)).getMonth() + 1}月達成`
                        : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
