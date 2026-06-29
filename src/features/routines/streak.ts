// ルーティンの連続日数・累計実行日数・習慣化判定（純粋関数）。
// REQUIREMENTS 6: 連続/累計は保存値ではなく DailyEntry から都度計算する。
import type { DailyEntry } from '../../domain/types';
import { addDays, dateKey } from '../../domain/ids';

/** 21日（3週間）連続で「習慣化」とみなす（REQUIREMENTS 4.3）。 */
export const HABITUATION_DAYS = 21;

export interface RoutineStats {
  current: number; // 連続○日数
  total: number; // 累計実行日数
  habituated: boolean; // 連続 >= 21
}

/** entries から routineId が done=true の日付集合を作る。 */
export function doneDates(
  entries: DailyEntry[],
  routineId: string,
): Set<string> {
  const set = new Set<string>();
  for (const e of entries) {
    if (e.deleted) continue;
    const check = e.routineChecks.find((c) => c.routineId === routineId);
    if (check?.done) set.add(e.date);
  }
  return set;
}

/**
 * 連続日数: today から1日ずつ遡って done が途切れるまで数える。
 * 今日まだ未記録なら昨日を基点に「継続中」とみなす
 * （サボり確定は日付が変わってから）。
 */
export function currentStreak(
  done: Set<string>,
  today: string = dateKey(),
): number {
  let cursor = today;
  if (!done.has(cursor)) {
    cursor = addDays(today, -1);
    if (!done.has(cursor)) return 0;
  }
  let n = 0;
  while (done.has(cursor)) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/** 1つのルーティンの統計をまとめて算出。 */
export function computeStats(
  entries: DailyEntry[],
  routineId: string,
  today: string = dateKey(),
): RoutineStats {
  const done = doneDates(entries, routineId);
  const current = currentStreak(done, today);
  // 連続が途切れても累計は保持（REQUIREMENTS 4.3「断続的でも継続は継続」）。
  return { current, total: done.size, habituated: current >= HABITUATION_DAYS };
}
