import { describe, it, expect } from 'vitest';
import {
  addTask,
  emptyEntry,
  isRoutineChecked,
  removeTask,
  toggleRoutineCheck,
  updateTask,
} from './dailyEntry';
import { createLocalDataStore } from '../../data/local/localRepository';

describe('dailyEntry pure helpers', () => {
  it('emptyEntry は id=date の空ドラフトを作る', () => {
    const e = emptyEntry('2026-06-29');
    expect(e.id).toBe('2026-06-29');
    expect(e.date).toBe('2026-06-29');
    expect(e.deleted).toBe(false);
    expect(e.tasks).toEqual([]);
    expect(e.routineChecks).toEqual([]);
  });

  it('toggleRoutineCheck / isRoutineChecked が状態を反転できる', () => {
    let e = emptyEntry('2026-06-29');
    expect(isRoutineChecked(e, 'r1')).toBe(false);
    e = toggleRoutineCheck(e, 'r1'); // 未記録 → done=true
    expect(isRoutineChecked(e, 'r1')).toBe(true);
    e = toggleRoutineCheck(e, 'r1'); // done=true → false
    expect(isRoutineChecked(e, 'r1')).toBe(false);
  });

  it('addTask / updateTask / removeTask が非破壊で動く', () => {
    const base = emptyEntry('2026-06-29');
    const a = addTask(base, '  朝の散歩  ');
    expect(a.tasks).toEqual(['朝の散歩']);
    expect(base.tasks).toEqual([]); // 元を破壊しない
    const u = updateTask(a, 0, '夜の散歩');
    expect(u.tasks).toEqual(['夜の散歩']);
    const r = removeTask(u, 0);
    expect(r.tasks).toEqual([]);
    // 空文字の追加は無視
    expect(addTask(base, '   ').tasks).toEqual([]);
  });
});

describe('DailyEntry の日付キー永続化（id=date）', () => {
  it('getById(date) で取得し、ルーティンチェックを保存・読み戻せる', async () => {
    const store = createLocalDataStore();
    const date = '2026-07-01'; // 他テストと衝突しない一意な日付

    // 初回は未保存
    expect(await store.dailyEntries.getById(date)).toBeUndefined();

    // 空ドラフトに編集を加えて保存
    let entry = emptyEntry(date);
    entry = addTask(entry, '日誌を書く');
    entry = toggleRoutineCheck(entry, 'routine-xyz');
    await store.dailyEntries.put(entry);

    // 日付キーで読み戻す
    const loaded = await store.dailyEntries.getById(date);
    expect(loaded).toBeDefined();
    expect(loaded?.tasks).toEqual(['日誌を書く']);
    expect(isRoutineChecked(loaded!, 'routine-xyz')).toBe(true);
  });
});
