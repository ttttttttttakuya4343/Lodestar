// スモークテスト（受け入れ基準）:
// DailyEntry を 1 件 Repository 経由で put → getById で読み戻せること。
// 併せて updatedAt 更新・論理削除の基本挙動も確認する。
import { describe, it, expect } from 'vitest';
import { createLocalDataStore } from './localRepository';
import { newId, nowIso, dateKey } from '../../domain/ids';
import type { DailyEntry } from '../../domain/types';

describe('LocalRepository (DailyEntry)', () => {
  it('put したレコードを getById で読み戻せる', async () => {
    const store = createLocalDataStore();

    const entry: DailyEntry = {
      id: newId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deleted: false,
      date: dateKey(),
      tasks: ['朝のストレッチ', '日誌を書く'],
      good: '早起きできた',
      redo: 'もっと水を飲む',
      routineChecks: [],
    };

    const saved = await store.dailyEntries.put(entry);
    const loaded = await store.dailyEntries.getById(entry.id);

    expect(loaded).toBeDefined();
    expect(loaded?.id).toBe(entry.id);
    expect(loaded?.good).toBe('早起きできた');
    expect(loaded?.tasks).toEqual(['朝のストレッチ', '日誌を書く']);
    // put は updatedAt を更新して返す
    expect(saved.updatedAt).toBeTruthy();
  });

  it('softDelete すると getById/getAll から除外される', async () => {
    const store = createLocalDataStore();
    const entry: DailyEntry = {
      id: newId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deleted: false,
      date: dateKey(),
      tasks: [],
      good: '',
      redo: '',
      routineChecks: [],
    };

    await store.dailyEntries.put(entry);
    await store.dailyEntries.softDelete(entry.id);

    expect(await store.dailyEntries.getById(entry.id)).toBeUndefined();
    const all = await store.dailyEntries.getAll();
    expect(all.find((r) => r.id === entry.id)).toBeUndefined();
  });
});
