// 日付ナビ: 前日 / 今日へ / 翌日。毎日触る画面なので前後日の閲覧・追記もできる。
import { addDays, dateKey, parseDateKey } from '../../domain/ids';

interface DateNavProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatLabel(date: string): string {
  const today = dateKey();
  if (date === today) return '今日';
  if (date === addDays(today, -1)) return '昨日';
  if (date === addDays(today, 1)) return '明日';
  const d = parseDateKey(date);
  return `${d.getMonth() + 1}月${d.getDate()}日 (${WEEKDAYS[d.getDay()]})`;
}

export function DateNav({ date, onChange }: DateNavProps) {
  const isToday = date === dateKey();
  return (
    <div className="mb-6 flex items-center justify-between">
      <button
        type="button"
        aria-label="前日"
        onClick={() => onChange(addDays(date, -1))}
        className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-weak active:bg-accent-weak"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={() => onChange(dateKey())}
        disabled={isToday}
        className="flex flex-col items-center px-4 disabled:opacity-100"
      >
        <span className="text-lg font-bold text-text">{formatLabel(date)}</span>
        {!isToday && (
          <span className="text-xs text-accent">今日へ戻る</span>
        )}
      </button>

      <button
        type="button"
        aria-label="翌日"
        onClick={() => onChange(addDays(date, 1))}
        className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-text-weak active:bg-accent-weak"
      >
        ›
      </button>
    </div>
  );
}
