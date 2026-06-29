import type { MonthlyReflection } from '../../domain/types';
import { nowIso } from '../../domain/ids';

// 設計判断（Phase 1 の決定に準拠）: MonthlyReflection.id = monthKey（YYYY-MM）。
// 1ヶ月1レコードに、カレンダー面（monthTasks/memo）とふりかえり面（insights）を集約する。
export function emptyMonthly(monthKey: string): MonthlyReflection {
  const ts = nowIso();
  return {
    id: monthKey,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    monthKey,
    monthTasks: [],
    memo: '',
    insights: '',
    habituatedRoutines: [], // 表示は streak から自動算出（保存はしない）
  };
}
