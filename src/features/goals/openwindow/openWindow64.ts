import type { OpenWindow64 } from '../../../domain/types';
import { nowIso } from '../../../domain/ids';

// オープンウィンドウ64（マンダラチャート）。一覧エンティティ（id=UUID, 複数枚）。
// blocks[9]: 各ブロックは中央ラベル＋周囲8マス。
//   blocks[0] = 中央ブロック（中央=テーマ、8マス=8ジャンル）
//   blocks[1..8] = 外周ブロック（中央=ジャンル、8マス=目標）
export function emptyOpenWindow64(
  id: string,
  type: 'future' | 'practice',
): OpenWindow64 {
  const ts = nowIso();
  return {
    id,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    type,
    title: '',
    star: [],
    // 各ブロック・各マスは独立した配列インスタンスにする（参照共有を避ける）。
    blocks: Array.from({ length: 9 }, () => ({
      center: '',
      cells: Array.from({ length: 8 }, () => ''),
    })),
  };
}

// 3×3 の見た目（row-major）→ ブロックの data index。
// 中央=blocks[0]、外周は真上から時計回り（N,NE,E,SE,S,SW,W,NW = blocks[1..8]）。
export const BLOCK_LAYOUT = [8, 1, 2, 7, 0, 3, 6, 5, 4] as const;

// ブロック内 3×3（row-major）→ cells index（-1 は中央ラベル）。
// 周囲8マスも真上から時計回り（cells[0]=真上 … cells[7]=左上）。
export const CELL_LAYOUT = [7, 0, 1, 6, -1, 2, 5, 4, 3] as const;
