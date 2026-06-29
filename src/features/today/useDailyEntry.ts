import { useCallback, useEffect, useState } from 'react';
import type { DailyEntry } from '../../domain/types';
import { dataStore } from '../../data';
import { useDebouncedCallback } from '../../lib/useDebouncedCallback';
import { emptyEntry } from './dailyEntry';

// 指定日の DailyEntry を取得し、編集を debounce 自動保存するフック。
// 未記入の日は空ドラフトを保持し、実際に編集が入るまで DB へは保存しない。
export function useDailyEntry(date: string) {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void dataStore.dailyEntries.getById(date).then((found) => {
      if (!active) return;
      setEntry(found ?? emptyEntry(date));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [date]);

  // 入力のたびに即保存（REQUIREMENTS 7）。put が updatedAt を更新する。
  const save = useDebouncedCallback((next: DailyEntry) => {
    void dataStore.dailyEntries.put(next);
  }, 500);

  // 純粋関数で作った次の entry を受け取り、state 更新＋保存予約する。
  const apply = useCallback(
    (producer: (prev: DailyEntry) => DailyEntry) => {
      setEntry((prev) => {
        if (!prev) return prev;
        const next = producer(prev);
        if (next === prev) return prev;
        save(next);
        return next;
      });
    },
    [save],
  );

  return { entry, loading, apply };
}
