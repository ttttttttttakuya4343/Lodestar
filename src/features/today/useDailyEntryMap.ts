import { useCallback, useEffect, useState } from 'react';
import type { DailyEntry } from '../../domain/types';
import { dataStore } from '../../data';

// 全 DailyEntry を date キーの Map で読み込む。
// 週ビューの各日グランスや月カレンダーの「記入あり」ドット表示に使う。
export function useDailyEntryMap() {
  const [map, setMap] = useState<Map<string, DailyEntry>>(new Map());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await dataStore.dailyEntries.getAll();
    setMap(new Map(all.map((e) => [e.date, e])));
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

  return { map, loading, reload };
}
