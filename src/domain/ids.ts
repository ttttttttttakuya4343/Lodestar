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
