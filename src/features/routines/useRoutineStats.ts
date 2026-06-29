import { useCallback, useEffect, useState } from 'react';
import type { DailyEntry } from '../../domain/types';
import { dataStore } from '../../data';
import { computeStats, type RoutineStats } from './streak';

// 全 DailyEntry を読み込み、ルーティンごとの連続/累計を算出するためのフック。
// 管理画面を開いたときに使う（毎日触る Today 画面には統計を載せず軽量に保つ）。
export function useRoutineStats() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await dataStore.dailyEntries.getAll();
    setEntries(all);
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

  const statsFor = useCallback(
    (routineId: string): RoutineStats => computeStats(entries, routineId),
    [entries],
  );

  return { statsFor, loading, reload };
}
