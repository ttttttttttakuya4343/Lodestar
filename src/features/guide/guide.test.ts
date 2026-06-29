import { describe, it, expect } from 'vitest';
import { GUIDE_BLOCKS, GUIDE_TITLE } from './guideContent';

describe('guide content', () => {
  it('タイトルと本文ブロックが存在する', () => {
    expect(GUIDE_TITLE.length).toBeGreaterThan(0);
    expect(GUIDE_BLOCKS.length).toBeGreaterThan(0);
    // 見出しと箇条書きが含まれる
    expect(GUIDE_BLOCKS.some((b) => b.type === 'h2')).toBe(true);
    expect(GUIDE_BLOCKS.some((b) => b.type === 'ul')).toBe(true);
  });
});
