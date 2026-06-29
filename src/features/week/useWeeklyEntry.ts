import { dataStore } from '../../data';
import { useKeyedRecord } from '../../lib/useKeyedRecord';
import { emptyWeekly } from './weeklyEntry';

// 指定週(weekKey)の WeeklyEntry を取得・編集・自動保存する。
export function useWeeklyEntry(weekKey: string) {
  return useKeyedRecord(dataStore.weeklyEntries, weekKey, emptyWeekly);
}
