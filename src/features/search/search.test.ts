import { describe, it, expect } from 'vitest';
import { makeSnippet, search, type SearchData } from './search';
import { emptyEntry, addTask } from '../today/dailyEntry';

function emptyData(): SearchData {
  return { daily: [], weekly: [], monthly: [], routines: [] };
}

describe('search', () => {
  it('空クエリは空配列', () => {
    expect(search('', emptyData())).toEqual([]);
    expect(search('  ', emptyData())).toEqual([]);
  });

  it('日次のよかったこと/タスクにヒットし、openDate を持つ', () => {
    const data = emptyData();
    let e = emptyEntry('2026-06-20');
    e = { ...e, good: '早起きできて気分がいい' };
    e = addTask(e, 'ランニング');
    data.daily = [e];

    const good = search('気分', data);
    expect(good).toHaveLength(1);
    expect(good[0]?.fieldLabel).toBe('よかったこと');
    expect(good[0]?.openDate).toBe('2026-06-20');

    expect(search('ランニング', data)[0]?.fieldLabel).toBe('タスク');
  });

  it('月次の気付き・ルーティン名にヒット（月/ルーティンは openDate なし）', () => {
    const data = emptyData();
    data.monthly = [
      {
        id: '2026-06',
        createdAt: 'x',
        updatedAt: 'x',
        deleted: false,
        monthKey: '2026-06',
        monthTasks: [],
        memo: '',
        insights: '継続の大切さに気付いた',
        habituatedRoutines: [],
      },
    ];
    data.routines = [
      {
        id: 'r1',
        createdAt: 'x',
        updatedAt: 'x',
        deleted: false,
        name: '読書',
        status: 'active',
      },
    ];

    const m = search('継続', data);
    expect(m[0]?.kind).toBe('monthly');
    expect(m[0]?.openDate).toBeUndefined();

    expect(search('読書', data)[0]?.kind).toBe('routine');
  });

  it('大文字小文字を無視する', () => {
    const data = emptyData();
    data.daily = [{ ...emptyEntry('2026-06-21'), good: 'Hello World' }];
    expect(search('hello', data)).toHaveLength(1);
  });

  it('makeSnippet は長文を前後省略付きで切り出す', () => {
    const text = 'あ'.repeat(50) + 'キーワード' + 'い'.repeat(50);
    const snip = makeSnippet(text, 'キーワード');
    expect(snip).toContain('キーワード');
    expect(snip.startsWith('…')).toBe(true);
    expect(snip.endsWith('…')).toBe(true);
  });
});
