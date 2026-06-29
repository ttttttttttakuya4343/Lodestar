// DailyEntry を操作する純粋関数群（React 非依存・テスト容易）。
// 設計判断: DailyEntry.id にはその日の日付キー（YYYY-MM-DD）を使う。
//   1日1レコードで自然に一意、getById(日付) で即取得でき、案Bの同期でも
//   日付単位の last-write-wins が素直に成立する。叩き台の「id も保持」を日付キーで満たす形。
import type { DailyEntry } from '../../domain/types';
import { nowIso } from '../../domain/ids';

/** 指定日の空の DailyEntry（未保存ドラフト）。id=date。 */
export function emptyEntry(date: string): DailyEntry {
  const ts = nowIso();
  return {
    id: date,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    date,
    tasks: [],
    good: '',
    redo: '',
    routineChecks: [],
  };
}

/** ルーティンのチェック状態を取得（未記録は未チェック扱い）。 */
export function isRoutineChecked(entry: DailyEntry, routineId: string): boolean {
  return entry.routineChecks.some((c) => c.routineId === routineId && c.done);
}

/** ルーティンの ○/× をトグルした新しい entry を返す（非破壊）。 */
export function toggleRoutineCheck(
  entry: DailyEntry,
  routineId: string,
): DailyEntry {
  const existing = entry.routineChecks.find((c) => c.routineId === routineId);
  const routineChecks = existing
    ? entry.routineChecks.map((c) =>
        c.routineId === routineId ? { ...c, done: !c.done } : c,
      )
    : [...entry.routineChecks, { routineId, done: true }];
  return { ...entry, routineChecks };
}

/** タスクを1件追加（空文字は無視）。 */
export function addTask(entry: DailyEntry, text: string): DailyEntry {
  const trimmed = text.trim();
  if (!trimmed) return entry;
  return { ...entry, tasks: [...entry.tasks, trimmed] };
}

/** index のタスク本文を更新。 */
export function updateTask(
  entry: DailyEntry,
  index: number,
  text: string,
): DailyEntry {
  if (index < 0 || index >= entry.tasks.length) return entry;
  const tasks = entry.tasks.map((t, i) => (i === index ? text : t));
  return { ...entry, tasks };
}

/** index のタスクを削除。 */
export function removeTask(entry: DailyEntry, index: number): DailyEntry {
  if (index < 0 || index >= entry.tasks.length) return entry;
  return { ...entry, tasks: entry.tasks.filter((_, i) => i !== index) };
}
