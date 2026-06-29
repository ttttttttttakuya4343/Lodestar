import { describe, it, expect, beforeEach } from 'vitest';
import { isGuideDismissed, setGuideDismissed } from './guide';
import { GUIDE_BLOCKS, GUIDE_TITLE } from './guideContent';

describe('guide dismissal flag', () => {
  beforeEach(() => {
    setGuideDismissed(false);
  });

  it('既定では未 dismiss（初回は自動表示される）', () => {
    expect(isGuideDismissed()).toBe(false);
  });

  it('dismiss を保存・解除できる', () => {
    setGuideDismissed(true);
    expect(isGuideDismissed()).toBe(true);
    setGuideDismissed(false);
    expect(isGuideDismissed()).toBe(false);
  });
});

describe('guide content', () => {
  it('タイトルと本文ブロックが存在する', () => {
    expect(GUIDE_TITLE.length).toBeGreaterThan(0);
    expect(GUIDE_BLOCKS.length).toBeGreaterThan(0);
    // 見出しと箇条書きが含まれる
    expect(GUIDE_BLOCKS.some((b) => b.type === 'h2')).toBe(true);
    expect(GUIDE_BLOCKS.some((b) => b.type === 'ul')).toBe(true);
  });
});
