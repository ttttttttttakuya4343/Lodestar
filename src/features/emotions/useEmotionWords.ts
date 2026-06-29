import { useCallback, useEffect, useState } from 'react';
import type { EmotionWord } from '../../domain/types';
import { dataStore } from '../../data';
import {
  ensureDefaultWords,
  makeEmotionWord,
  DEFAULT_EMOTION_WORDS,
} from './emotionWords';

// セッション内での重複シードを防ぐ（複数フックが同時に空テーブルを見ても1回だけ）。
let seedPromise: Promise<void> | null = null;

// プラス感情ワード集の取得・追加・削除。初回は既定語を投入する。
export function useEmotionWords() {
  const [words, setWords] = useState<EmotionWord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!seedPromise) seedPromise = ensureDefaultWords(dataStore);
    await seedPromise;
    const all = await dataStore.emotionWords.getAll();
    all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    setWords(all);
  }, []);

  useEffect(() => {
    let active = true;
    void reload().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reload]);

  const add = useCallback(
    async (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      // 同じラベルが既にあれば追加しない。
      if (words.some((w) => w.label === trimmed)) return;
      await dataStore.emotionWords.put(makeEmotionWord(trimmed, true));
      await reload();
    },
    [words, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await dataStore.emotionWords.softDelete(id);
      await reload();
    },
    [reload],
  );

  const labels = words.map((w) => w.label);

  return { words, labels, loading, add, remove, defaults: DEFAULT_EMOTION_WORDS };
}
