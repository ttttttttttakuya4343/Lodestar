import { describe, it, expect } from 'vitest';
import { computeStats, currentStreak, doneDates, HABITUATION_DAYS } from './streak';
import { emptyEntry, toggleRoutineCheck } from '../today/dailyEntry';
import { addDays } from '../../domain/ids';
import type { DailyEntry } from '../../domain/types';

const TODAY = '2026-06-29';
const RID = 'r1';

// 指定日リストで RID を done にした DailyEntry 配列を作るヘルパー。
function entriesDoneOn(dates: string[]): DailyEntry[] {
  return dates.map((d) => toggleRoutineCheck(emptyEntry(d), RID));
}

describe('streak 計算', () => {
  it('記録なしは連続0・累計0・未習慣化', () => {
    const stats = computeStats([], RID, TODAY);
    expect(stats).toEqual({ current: 0, total: 0, habituated: false });
  });

  it('今日まで3日連続なら連続=3', () => {
    const entries = entriesDoneOn([
      addDays(TODAY, -2),
      addDays(TODAY, -1),
      TODAY,
    ]);
    expect(currentStreak(doneDates(entries, RID), TODAY)).toBe(3);
  });

  it('今日未記録でも昨日までで継続中とみなす', () => {
    const entries = entriesDoneOn([addDays(TODAY, -2), addDays(TODAY, -1)]);
    expect(currentStreak(doneDates(entries, RID), TODAY)).toBe(2);
  });

  it('一昨日で途切れていれば連続0、累計は保持', () => {
    // 今日・昨日は未記録、3日前のみ done
    const entries = entriesDoneOn([addDays(TODAY, -3)]);
    const stats = computeStats(entries, RID, TODAY);
    expect(stats.current).toBe(0);
    expect(stats.total).toBe(1);
  });

  it('途切れがあっても累計は全 done 日数', () => {
    const entries = entriesDoneOn([
      addDays(TODAY, -10),
      addDays(TODAY, -1),
      TODAY,
    ]);
    const stats = computeStats(entries, RID, TODAY);
    expect(stats.current).toBe(2); // 今日・昨日
    expect(stats.total).toBe(3); // 10日前を含む
  });

  it('21日連続で習慣化と判定', () => {
    const dates: string[] = [];
    for (let i = 0; i < HABITUATION_DAYS; i += 1) dates.push(addDays(TODAY, -i));
    const stats = computeStats(entriesDoneOn(dates), RID, TODAY);
    expect(stats.current).toBe(21);
    expect(stats.habituated).toBe(true);
  });

  it('20日連続では未習慣化', () => {
    const dates: string[] = [];
    for (let i = 0; i < 20; i += 1) dates.push(addDays(TODAY, -i));
    expect(computeStats(entriesDoneOn(dates), RID, TODAY).habituated).toBe(false);
  });
});
