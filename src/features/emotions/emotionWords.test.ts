import { describe, it, expect } from 'vitest';
import {
  DEFAULT_EMOTION_WORDS,
  ensureDefaultWords,
  makeEmotionWord,
  unusedSuggestions,
} from './emotionWords';
import { createLocalDataStore } from '../../data/local/localRepository';

describe('emotion words', () => {
  it('既定語は重複なし・非空', () => {
    expect(DEFAULT_EMOTION_WORDS.length).toBeGreaterThan(0);
    expect(new Set(DEFAULT_EMOTION_WORDS).size).toBe(DEFAULT_EMOTION_WORDS.length);
  });

  it('makeEmotionWord は isCustom を反映', () => {
    expect(makeEmotionWord('感謝', false).isCustom).toBe(false);
    expect(makeEmotionWord('わくわく', true).isCustom).toBe(true);
  });

  it('unusedSuggestions は選択済みを除外', () => {
    expect(unusedSuggestions(['a', 'b', 'c'], ['b'])).toEqual(['a', 'c']);
    expect(unusedSuggestions(['a'], ['a'])).toEqual([]);
  });

  it('ensureDefaultWords は空のときだけ投入し、二度目は増やさない', async () => {
    const store = createLocalDataStore();
    // 事前に他テストのデータが残っていない前提で、空なら投入される
    const before = await store.emotionWords.getAll();
    await ensureDefaultWords(store);
    const after = await store.emotionWords.getAll();
    if (before.length === 0) {
      expect(after.length).toBe(DEFAULT_EMOTION_WORDS.length);
    }
    // 二度目は何も追加しない
    const count = after.length;
    await ensureDefaultWords(store);
    expect((await store.emotionWords.getAll()).length).toBe(count);
  });
});
