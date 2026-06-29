import { describe, it, expect } from 'vitest';
import { createLocalDataStore } from '../../data/local/localRepository';
import { pushTrimmed } from '../../lib/arrayOps';
import { emptyMonthly } from './monthlyReflection';

describe('MonthlyReflection 永続化 (id=monthKey)', () => {
  it('monthKey で monthTasks/memo/insights を put→getById できる', async () => {
    const store = createLocalDataStore();
    const mk = '2026-10'; // 一意キー
    expect(await store.monthlyReflections.getById(mk)).toBeUndefined();

    let m = emptyMonthly(mk);
    expect(m.id).toBe(mk);
    m = {
      ...m,
      monthTasks: pushTrimmed(m.monthTasks, '健康診断を予約'),
      memo: '繁忙期',
      insights: '早寝が効いた',
    };
    await store.monthlyReflections.put(m);

    const loaded = await store.monthlyReflections.getById(mk);
    expect(loaded?.monthTasks).toEqual(['健康診断を予約']);
    expect(loaded?.memo).toBe('繁忙期');
    expect(loaded?.insights).toBe('早寝が効いた');
  });
});
