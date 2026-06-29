import { useState } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { Section } from '../../components/Section';
import { StringListEditor } from '../../components/StringListEditor';
import { TagListEditor } from '../../components/TagListEditor';
import {
  addDays,
  dateKey,
  mondayOf,
  parseDateKey,
  weekDates,
  weekKey as weekKeyOf,
} from '../../domain/ids';
import { pushTrimmed, removeAt, setAt } from '../../lib/arrayOps';
import { useRoutines } from '../routines/useRoutines';
import { useDailyEntryMap } from '../today/useDailyEntryMap';
import { useWeeklyEntry } from './useWeeklyEntry';

interface WeekScreenProps {
  onOpenDay: (date: string) => void;
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

function rangeLabel(monday: string): string {
  const sunday = addDays(monday, 6);
  const m = parseDateKey(monday);
  const s = parseDateKey(sunday);
  return `${m.getMonth() + 1}月${m.getDate()}日 - ${s.getMonth() + 1}月${s.getDate()}日`;
}

export function WeekScreen({ onOpenDay }: WeekScreenProps) {
  const [monday, setMonday] = useState(() => mondayOf(dateKey()));
  const wk = weekKeyOf(parseDateKey(monday));
  const { record, loading, apply } = useWeeklyEntry(wk);
  const { routines } = useRoutines();
  const { map } = useDailyEntryMap();

  const isThisWeek = monday === mondayOf(dateKey());

  return (
    <ScreenScaffold eyebrow="WEEK" title="週ビュー">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          aria-label="前週"
          onClick={() => setMonday(addDays(monday, -7))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-weak active:bg-accent-weak"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setMonday(mondayOf(dateKey()))}
          disabled={isThisWeek}
          className="flex flex-col items-center px-4 disabled:opacity-100"
        >
          <span className="text-base font-bold text-text">{rangeLabel(monday)}</span>
          {!isThisWeek && <span className="text-xs text-accent">今週へ戻る</span>}
        </button>
        <button
          type="button"
          aria-label="翌週"
          onClick={() => setMonday(addDays(monday, 7))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-weak active:bg-accent-weak"
        >
          ›
        </button>
      </div>

      {loading || !record ? (
        <p className="text-text-weak">読み込み中…</p>
      ) : (
        <>
          <Section title="今週のタスク">
            <StringListEditor
              items={record.weekTasks}
              placeholder="今週のタスクを追加"
              onAdd={(t) =>
                apply((p) => ({ ...p, weekTasks: pushTrimmed(p.weekTasks, t) }))
              }
              onUpdate={(i, t) =>
                apply((p) => ({ ...p, weekTasks: setAt(p.weekTasks, i, t) }))
              }
              onRemove={(i) =>
                apply((p) => ({ ...p, weekTasks: removeAt(p.weekTasks, i) }))
              }
            />
          </Section>

          <Section title="今週感じたいプラス感情">
            <TagListEditor
              tags={record.targetEmotions}
              placeholder="感情の言葉を追加"
              onAdd={(t) =>
                apply((p) => ({
                  ...p,
                  targetEmotions: pushTrimmed(p.targetEmotions, t),
                }))
              }
              onRemove={(i) =>
                apply((p) => ({
                  ...p,
                  targetEmotions: removeAt(p.targetEmotions, i),
                }))
              }
            />
          </Section>

          <Section title="今週のルーティン行動">
            {routines.length === 0 ? (
              <p className="rounded-card border border-line bg-surface p-3 text-sm text-text-weak">
                登録中のルーティンはありません。
              </p>
            ) : (
              <ul className="space-y-1.5">
                {routines.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 text-base"
                  >
                    <span className="text-accent" aria-hidden>
                      ○
                    </span>
                    {r.name}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="各日の予定">
            <ul className="space-y-2">
              {weekDates(monday).map((day, i) => {
                const entry = map.get(day);
                const taskCount = entry?.tasks.length ?? 0;
                const doneCount =
                  entry?.routineChecks.filter((c) => c.done).length ?? 0;
                const isToday = day === dateKey();
                const d = parseDateKey(day);
                return (
                  <li key={day}>
                    <button
                      type="button"
                      onClick={() => onOpenDay(day)}
                      className={`flex w-full items-center gap-3 rounded-card border px-3 py-2.5 text-left active:bg-accent-weak ${
                        isToday ? 'border-accent bg-accent-weak' : 'border-line bg-surface'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-bg text-xs">
                        <span className="text-text-weak">{WEEKDAYS[i]}</span>
                        <span className="font-semibold text-text">{d.getDate()}</span>
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-text-weak">
                        {taskCount > 0 || doneCount > 0
                          ? `タスク${taskCount}・ルーティン${doneCount}`
                          : '記入なし'}
                      </span>
                      <span className="text-text-weak" aria-hidden>
                        ›
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>
        </>
      )}
    </ScreenScaffold>
  );
}
