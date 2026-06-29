import { describe, it, expect } from 'vitest';
import { createLocalDataStore } from '../../../data/local/localRepository';
import { newId } from '../../../domain/ids';
import { emptyStarSheet } from './starSheet';

describe('StarSheet', () => {
  it('emptyStarSheet は STEP1〜5 を空で初期化する', () => {
    const s = emptyStarSheet('id-1');
    expect(s.id).toBe('id-1');
    expect(s.step1).toEqual({ home: '', work: '' });
    expect(s.step2.socialTangible).toEqual([]);
    expect(s.step4.milestones).toEqual([]);
    expect(s.step5.strokes).toEqual([]);
  });

  it('一覧エンティティとして put→getById、getAll で複数保持できる', async () => {
    const store = createLocalDataStore();
    const id1 = newId();
    const id2 = newId();

    await store.starSheets.put({
      ...emptyStarSheet(id1),
      title: 'キャリア',
      step3: { positiveSentence: '私は2027年3月までに昇進する！' },
      step4: {
        routines: ['英語30分'],
        milestones: [{ text: '資格取得', dueDate: '2026-12-31' }],
      },
    });
    await store.starSheets.put({ ...emptyStarSheet(id2), title: '健康' });

    const loaded = await store.starSheets.getById(id1);
    expect(loaded?.title).toBe('キャリア');
    expect(loaded?.step4.milestones[0]?.dueDate).toBe('2026-12-31');

    const all = await store.starSheets.getAll();
    const ids = all.map((s) => s.id);
    expect(ids).toContain(id1);
    expect(ids).toContain(id2);
  });
});
