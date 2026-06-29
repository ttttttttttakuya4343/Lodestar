import { describe, it, expect } from 'vitest';
import { createLocalDataStore } from '../../../data/local/localRepository';
import { newId } from '../../../domain/ids';
import { BLOCK_LAYOUT, CELL_LAYOUT, emptyOpenWindow64 } from './openWindow64';

describe('OpenWindow64', () => {
  it('emptyOpenWindow64 は 9ブロック×8マスで初期化（配列は独立）', () => {
    const ow = emptyOpenWindow64('id-1', 'future');
    expect(ow.type).toBe('future');
    expect(ow.blocks).toHaveLength(9);
    for (const b of ow.blocks) expect(b.cells).toHaveLength(8);
    // 参照共有していないこと
    ow.blocks[0]!.cells[0] = 'x';
    expect(ow.blocks[1]!.cells[0]).toBe('');
  });

  it('BLOCK_LAYOUT は 0..8 の並べ替え（中央=0 を含む）', () => {
    expect([...BLOCK_LAYOUT].sort((a, b) => a - b)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it('CELL_LAYOUT は中央(-1)＋ 0..7 の並べ替え', () => {
    expect([...CELL_LAYOUT].sort((a, b) => a - b)).toEqual([
      -1, 0, 1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it('一覧エンティティとして put→getById でき、マスの編集が保存される', async () => {
    const store = createLocalDataStore();
    const id = newId();
    const ow = emptyOpenWindow64(id, 'practice');
    ow.title = '2027目標';
    ow.blocks[0]!.center = '自分の未来';
    ow.blocks[1]!.cells[0] = '健康';
    await store.openWindow64.put(ow);

    const loaded = await store.openWindow64.getById(id);
    expect(loaded?.type).toBe('practice');
    expect(loaded?.blocks[0]?.center).toBe('自分の未来');
    expect(loaded?.blocks[1]?.cells[0]).toBe('健康');
  });
});
