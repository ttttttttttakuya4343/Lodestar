import { useState } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { Section } from '../../components/Section';
import { parseDateKey } from '../../domain/ids';
import { useStarSheets } from './useStarSheets';
import { useOpenWindows } from './useOpenWindows';
import { StarSheetEditor } from './starsheet/StarSheetEditor';
import { OpenWindow64Editor } from './openwindow/OpenWindow64Editor';

function formatUpdated(iso: string): string {
  const d = parseDateKey(iso.slice(0, 10));
  return `${d.getMonth() + 1}/${d.getDate()} 更新`;
}

export function GoalsScreen() {
  const sheets = useStarSheets();
  const windows = useOpenWindows();
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editingOwId, setEditingOwId] = useState<string | null>(null);
  const [owChooser, setOwChooser] = useState(false);

  const openNewSheet = async () => {
    setEditingSheetId(await sheets.create());
  };

  const openNewWindow = async (type: 'future' | 'practice') => {
    setOwChooser(false);
    setEditingOwId(await windows.create(type));
  };

  return (
    <ScreenScaffold eyebrow="GOALS" title="目標">
      <Section
        title="スターシート"
        action={
          <button
            type="button"
            onClick={() => void openNewSheet()}
            className="text-sm font-semibold text-accent active:opacity-80"
          >
            ＋ 新規
          </button>
        }
      >
        {sheets.loading ? (
          <p className="text-text-weak">読み込み中…</p>
        ) : sheets.sheets.length === 0 ? (
          <p className="rounded-card border border-line bg-surface p-3 text-sm text-text-weak">
            まだスターシートがありません。「＋ 新規」で1年後の目標を描きましょう。
          </p>
        ) : (
          <ul className="space-y-2">
            {sheets.sheets.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSheetId(s.id)}
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
                  onClick={() => void sheets.remove(s.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-weak active:bg-accent-weak"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="オープンウィンドウ64"
        action={
          <button
            type="button"
            onClick={() => setOwChooser((v) => !v)}
            className="text-sm font-semibold text-accent active:opacity-80"
          >
            ＋ 新規
          </button>
        }
      >
        {owChooser && (
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => void openNewWindow('future')}
              className="flex-1 rounded-card border border-accent bg-accent-weak px-3 py-2.5 text-sm font-semibold text-text active:opacity-90"
            >
              未来思考編
            </button>
            <button
              type="button"
              onClick={() => void openNewWindow('practice')}
              className="flex-1 rounded-card border border-accent bg-accent-weak px-3 py-2.5 text-sm font-semibold text-text active:opacity-90"
            >
              実践思考編
            </button>
          </div>
        )}

        {windows.loading ? (
          <p className="text-text-weak">読み込み中…</p>
        ) : windows.charts.length === 0 ? (
          <p className="rounded-card border border-line bg-surface p-3 text-sm text-text-weak">
            まだチャートがありません。「＋ 新規」でマンダラチャートを作りましょう。
          </p>
        ) : (
          <ul className="space-y-2">
            {windows.charts.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOwId(c.id)}
                  className="flex min-w-0 flex-1 items-center justify-between rounded-card border border-line bg-surface px-3 py-3 text-left active:bg-accent-weak"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded-full bg-accent-weak px-2 py-0.5 text-xs text-text">
                      {c.type === 'future' ? '未来' : '実践'}
                    </span>
                    <span className="min-w-0 truncate text-base text-text">
                      {c.title.trim() || '無題のチャート'}
                    </span>
                  </span>
                  <span className="ml-2 shrink-0 text-xs text-text-weak">
                    {formatUpdated(c.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="削除"
                  onClick={() => void windows.remove(c.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-weak active:bg-accent-weak"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {editingSheetId && (
        <StarSheetEditor
          id={editingSheetId}
          onClose={() => setEditingSheetId(null)}
        />
      )}
      {editingOwId && (
        <OpenWindow64Editor
          id={editingOwId}
          onClose={() => setEditingOwId(null)}
        />
      )}
    </ScreenScaffold>
  );
}
