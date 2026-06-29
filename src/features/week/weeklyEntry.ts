import type { WeeklyEntry } from '../../domain/types';
import { nowIso } from '../../domain/ids';

// 設計判断（Phase 1 の決定に準拠）: WeeklyEntry.id = weekKey（YYYY-Www）。
// 1週1レコードで一意になり、getById(weekKey) で取得できる。
export function emptyWeekly(weekKey: string): WeeklyEntry {
  const ts = nowIso();
  return {
    id: weekKey,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    weekKey,
    weekTasks: [],
    targetEmotions: [],
  };
}
