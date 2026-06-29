import { useState } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { Section } from '../../components/Section';
import { parseDateKey } from '../../domain/ids';
import { useStarSheets } from './useStarSheets';
import { StarSheetEditor } from './starsheet/StarSheetEditor';

function formatUpdated(iso: string): string {
  const d = parseDateKey(iso.slice(0, 10));
  return `${d.getMonth() + 1}/${d.getDate()} 更新`;
}

export function GoalsScreen() {
  const { sheets, loading, create, remove } = useStarSheets();
  const [editingId, setEditingId] = useState<string | null>(null);

  const openNew = async () => {
    const id = await create();
    setEditingId(id);
  };

  return (
    <ScreenScaffold eyebrow="GOALS" title="目標">
      <Section
        title="スターシート"
        action={
          <button
            type="button"
            onClick={() => void openNew()}
            className="text-sm font-semibold text-accent active:opacity-80"
          >
            ＋ 新規
          </button>
        }
      >
        {loading ? (
          <p className="text-text-weak">読み込み中…</p>
        ) : sheets.length === 0 ? (
          <p className="rounded-card border border-line bg-surface p-3 text-sm text-text-weak">
            まだスターシートがありません。「＋ 新規」で1年後の目標を描きましょう。
          </p>
        ) : (
          <ul className="space-y-2">
            {sheets.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(s.id)}
                  className="flex min-w-0 flex-1 items-center justify-between rounded-card border border-line bg-surface px-3 py-3 text-left active:bg-accent-weak"
                >
                  <span className="min-w-0 truncate text-base text-text">
                    {s.title.trim() || '無題のスターシート'}
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-text-weak">
                    {formatUpdated(s.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="削除"
                  onClick={() => void remove(s.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-weak active:bg-accent-weak"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* オープンウィンドウ64 は Phase 4 後半（次PR）で追加 */}

      {editingId && (
        <StarSheetEditor id={editingId} onClose={() => setEditingId(null)} />
      )}
    </ScreenScaffold>
  );
}
