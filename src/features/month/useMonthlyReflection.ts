import { dataStore } from '../../data';
import { useKeyedRecord } from '../../lib/useKeyedRecord';
import { emptyMonthly } from './monthlyReflection';

// 指定月(monthKey)の MonthlyReflection を取得・編集・自動保存する。
export function useMonthlyReflection(monthKey: string) {
  return useKeyedRecord(dataStore.monthlyReflections, monthKey, emptyMonthly);
}
