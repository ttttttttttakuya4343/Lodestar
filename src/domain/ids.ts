// ID・日付キー生成ユーティリティ。
// レコード id は UUID。日付/週/月キーは紙の構成（YYYY-MM-DD / YYYY-Www / YYYY-MM）に対応。

/** レコード用 UUID を生成（crypto.randomUUID は Vite/モダンブラウザ・Node18+ で利用可）。 */
export function newId(): string {
  return crypto.randomUUID();
}

/** 現在時刻の ISO8601 文字列。createdAt / updatedAt に使用。 */
export function nowIso(): string {
  return new Date().toISOString();
}

/** ローカルタイムの YYYY-MM-DD（DailyEntry.date 用）。 */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 日付キー(YYYY-MM-DD)を Date に戻す（ローカルタイム正午基準で DST ずれを避ける）。 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

/** 日付キーに days 日加算した新しい日付キーを返す。 */
export function addDays(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

/** ローカルタイムの YYYY-MM（MonthlyReflection.monthKey 用）。 */
export function monthKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** ISO 8601 週番号に基づく YYYY-Www（WeeklyEntry.weekKey 用）。月曜始まり。 */
export function weekKey(d: Date = new Date()): string {
  // UTC ベースでコピーし、木曜日に寄せて年と週番号を決める（ISO 8601 方式）
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7; // 月曜=0 … 日曜=6
  target.setUTCDate(target.getUTCDate() - dayNum + 3); // その週の木曜
  const isoYear = target.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week =
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

/** その日が属する週の月曜日（YYYY-MM-DD）。ISO週＝月曜始まり。 */
export function mondayOf(key: string): string {
  const dayNum = (parseDateKey(key).getDay() + 6) % 7; // 月曜=0 … 日曜=6
  return addDays(key, -dayNum);
}

/** 月曜キーから1週間（月〜日）の日付キー配列。 */
export function weekDates(mondayKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayKey, i));
}

/** 月キー(YYYY-MM)に n ヶ月加算した新しい月キー。 */
export function addMonths(key: string, n: number): string {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y ?? 1970, (m ?? 1) - 1 + n, 1));
}

/** 月キーの末日（28〜31）。 */
export function lastDateOfMonth(key: string): number {
  const [y, m] = key.split('-').map(Number);
  return new Date(y ?? 1970, m ?? 1, 0).getDate();
}

/** 日付キーがその月キーに属するか。 */
export function isInMonth(dayKey: string, key: string): boolean {
  return dayKey.slice(0, 7) === key;
}

/**
 * 月間カレンダー用の日付グリッド（月曜始まり）。
 * 当月をすべて含む週単位（5〜6週×7日）に整え、前後の隣月の日も含めて返す。
 */
export function monthGrid(key: string): string[] {
  const start = mondayOf(`${key}-01`);
  const end = addDays(mondayOf(`${key}-${String(lastDateOfMonth(key)).padStart(2, '0')}`), 6);
  const days: string[] = [];
  for (let cur = start; cur <= end; cur = addDays(cur, 1)) days.push(cur);
  return days;
}
