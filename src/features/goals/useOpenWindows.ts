import { useCallback, useEffect, useState } from 'react';
import type { OpenWindow64 } from '../../domain/types';
import { dataStore } from '../../data';
import { newId } from '../../domain/ids';
import { emptyOpenWindow64 } from './openwindow/openWindow64';

// オープンウィンドウ64 一覧の取得・新規作成（type 指定）・削除。更新日の新しい順。
export function useOpenWindows() {
  const [charts, setCharts] = useState<OpenWindow64[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await dataStore.openWindow64.getAll();
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setCharts(all);
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

  const create = useCallback(
    async (type: 'future' | 'practice'): Promise<string> => {
      const chart = emptyOpenWindow64(newId(), type);
      await dataStore.openWindow64.put(chart);
      await reload();
      return chart.id;
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await dataStore.openWindow64.softDelete(id);
      await reload();
    },
    [reload],
  );

  return { charts, loading, create, remove, reload };
}
