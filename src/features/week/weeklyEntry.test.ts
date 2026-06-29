import { describe, it, expect } from 'vitest';
import { createLocalDataStore } from '../../data/local/localRepository';
import { pushTrimmed } from '../../lib/arrayOps';
import { emptyWeekly } from './weeklyEntry';

describe('WeeklyEntry 永続化 (id=weekKey)', () => {
  it('weekKey で put→getById できる', async () => {
    const store = createLocalDataStore();
    const wk = '2026-W40'; // 他テストと衝突しない一意キー
    expect(await store.weeklyEntries.getById(wk)).toBeUndefined();

    let e = emptyWeekly(wk);
    expect(e.id).toBe(wk);
    e = {
      ...e,
      weekTasks: pushTrimmed(e.weekTasks, '企画書を書く'),
      targetEmotions: pushTrimmed(e.targetEmotions, 'わくわく'),
    };
    await store.weeklyEntries.put(e);

    const loaded = await store.weeklyEntries.getById(wk);
    expect(loaded?.weekTasks).toEqual(['企画書を書く']);
    expect(loaded?.targetEmotions).toEqual(['わくわく']);
  });
});
