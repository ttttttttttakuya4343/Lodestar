// 月間カレンダー（月曜始まり）。記入のある日にドット、当日を強調。日タップで日次へ遷移。
import type { DailyEntry } from '../../domain/types';
import { dateKey, isInMonth, monthGrid, parseDateKey } from '../../domain/ids';

interface CalendarProps {
  monthKey: string;
  entryMap: Map<string, DailyEntry>;
  onOpenDay: (date: string) => void;
}

const WEEKDAY_HEADERS = ['月', '火', '水', '木', '金', '土', '日'];

function hasContent(e: DailyEntry | undefined): boolean {
  if (!e) return false;
  return (
    e.tasks.length > 0 ||
    e.good.trim() !== '' ||
    e.redo.trim() !== '' ||
    e.routineChecks.some((c) => c.done)
  );
}

export function Calendar({ monthKey, entryMap, onOpenDay }: CalendarProps) {
  const today = dateKey();
  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-text-weak">
        {WEEKDAY_HEADERS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthGrid(monthKey).map((day) => {
          const inMonth = isInMonth(day, monthKey);
          const isToday = day === today;
          const marked = hasContent(entryMap.get(day));
          return (
            <button
              key={day}
              type="button"
              onClick={() => onOpenDay(day)}
              className={`flex aspect-square flex-col items-center justify-center rounded-card text-sm active:bg-accent-weak ${
                isToday ? 'bg-accent-weak font-bold text-text' : ''
              } ${inMonth ? 'text-text' : 'text-text-weak/40'}`}
            >
              {parseDateKey(day).getDate()}
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${
                  marked ? 'bg-accent' : 'bg-transparent'
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
