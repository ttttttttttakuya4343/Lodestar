import { describe, it, expect } from 'vitest';
import {
  addMonths,
  isInMonth,
  lastDateOfMonth,
  mondayOf,
  monthGrid,
  weekDates,
} from './ids';

describe('week helpers', () => {
  it('mondayOf は週の月曜を返す（月曜始まり）', () => {
    // 2026-06-29 は月曜
    expect(mondayOf('2026-06-29')).toBe('2026-06-29');
    // 2026-07-01(水) の週の月曜は 2026-06-29
    expect(mondayOf('2026-07-01')).toBe('2026-06-29');
    // 2026-07-05(日) の週の月曜も 2026-06-29
    expect(mondayOf('2026-07-05')).toBe('2026-06-29');
  });

  it('weekDates は月〜日の7日を返す', () => {
    const dates = weekDates('2026-06-29');
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe('2026-06-29'); // 月
    expect(dates[6]).toBe('2026-07-05'); // 日
  });
});

describe('month helpers', () => {
  it('addMonths は年跨ぎも正しく扱う', () => {
    expect(addMonths('2026-06', 1)).toBe('2026-07');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('lastDateOfMonth', () => {
    expect(lastDateOfMonth('2026-06')).toBe(30);
    expect(lastDateOfMonth('2026-02')).toBe(28);
    expect(lastDateOfMonth('2024-02')).toBe(29); // 閏年
  });

  it('isInMonth', () => {
    expect(isInMonth('2026-06-15', '2026-06')).toBe(true);
    expect(isInMonth('2026-07-01', '2026-06')).toBe(false);
  });

  it('monthGrid は月曜始まりで7の倍数日・月内全日を含む', () => {
    const grid = monthGrid('2026-06');
    expect(grid.length % 7).toBe(0);
    expect(grid[0]).toBe(mondayOf('2026-06-01')); // 先頭は1日の週の月曜
    expect(grid).toContain('2026-06-01');
    expect(grid).toContain('2026-06-30');
  });
});
