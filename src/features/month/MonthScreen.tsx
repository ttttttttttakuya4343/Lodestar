import { useState } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { Section } from '../../components/Section';
import { StringListEditor } from '../../components/StringListEditor';
import { addMonths, lastDateOfMonth, monthKey as monthKeyOf } from '../../domain/ids';
import { pushTrimmed, removeAt, setAt } from '../../lib/arrayOps';
import { JournalTextField } from '../today/JournalTextField';
import { useDailyEntryMap } from '../today/useDailyEntryMap';
import { useRoutines } from '../routines/useRoutines';
import { doneDates, habituatedInMonth } from '../routines/streak';
import { Calendar } from './Calendar';
import { useMonthlyReflection } from './useMonthlyReflection';

interface MonthScreenProps {
  onOpenDay: (date: string) => void;
}

function monthTitle(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  return `${y}年${Number(m)}月`;
}

export function MonthScreen({ onOpenDay }: MonthScreenProps) {
  const [month, setMonth] = useState(() => monthKeyOf());
  const { record, loading, apply } = useMonthlyReflection(month);
  const { map } = useDailyEntryMap();
  const { routines, archived } = useRoutines();

  const isThisMonth = month === monthKeyOf();

  // 今月習慣化できたルーティンを自動算出（active + archived から）。
  const entries = Array.from(map.values());
  const lastDay = lastDateOfMonth(month);
  const habituatedNames = [...routines, ...archived]
    .filter((r) => habituatedInMonth(doneDates(entries, r.id), month, lastDay))
    .map((r) => r.name);

  return (
    <ScreenScaffold eyebrow="MONTH" title="月ビュー">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          aria-label="前月"
          onClick={() => setMonth(addMonths(month, -1))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-weak active:bg-accent-weak"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setMonth(monthKeyOf())}
          disabled={isThisMonth}
          className="flex flex-col items-center px-4 disabled:opacity-100"
        >
          <span className="text-lg font-bold text-text">{monthTitle(month)}</span>
          {!isThisMonth && <span className="text-xs text-accent">今月へ戻る</span>}
        </button>
        <button
          type="button"
          aria-label="翌月"
          onClick={() => setMonth(addMonths(month, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-weak active:bg-accent-weak"
        >
          ›
        </button>
      </div>

      <Section title="カレンダー">
        <Calendar monthKey={month} entryMap={map} onOpenDay={onOpenDay} />
      </Section>

      {loading || !record ? (
        <p className="text-text-weak">読み込み中…</p>
      ) : (
        <>
          <Section title="今月やること">
            <StringListEditor
              items={record.monthTasks}
              placeholder="今月やることを追加"
              onAdd={(t) =>
                apply((p) => ({ ...p, monthTasks: pushTrimmed(p.monthTasks, t) }))
              }
              onUpdate={(i, t) =>
                apply((p) => ({ ...p, monthTasks: setAt(p.monthTasks, i, t) }))
              }
              onRemove={(i) =>
                apply((p) => ({ ...p, monthTasks: removeAt(p.monthTasks, i) }))
              }
            />
          </Section>

          <Section title="MEMO">
            <JournalTextField
              label="メモ"
              placeholder="今月のメモ"
              value={record.memo}
              onChange={(v) => apply((p) => ({ ...p, memo: v }))}
            />
          </Section>

          <Section title="今月の気付き">
            <JournalTextField
              label="気付き"
              placeholder="今月をふりかえって感じたこと"
              value={record.insights}
              onChange={(v) => apply((p) => ({ ...p, insights: v }))}
            />
          </Section>

          <Section title="今月習慣化できたルーティン">
            {habituatedNames.length === 0 ? (
              <p className="rounded-card border border-line bg-surface p-3 text-sm text-text-weak">
                まだありません。21日続けば習慣化です。
              </p>
            ) : (
              <ul className="space-y-1.5">
                {habituatedNames.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 rounded-card bg-accent-weak px-3 py-2 text-base text-text"
                  >
                    🏅 {name}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </ScreenScaffold>
  );
}
