import { useCallback, useEffect, useState } from 'react';
import type { Routine } from '../../domain/types';
import { dataStore } from '../../data';
import { newId, nowIso } from '../../domain/ids';

// Phase 1 の最小ルーティン管理: アクティブなルーティンの取得・追加・削除。
// 連続/累計カウント・21日習慣化判定・アーカイブは Phase 2 で実装する。
export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await dataStore.routines.getAll();
    setRoutines(all.filter((r) => r.status === 'active'));
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

  const addRoutine = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const ts = nowIso();
      const routine: Routine = {
        id: newId(),
        createdAt: ts,
        updatedAt: ts,
        deleted: false,
        name: trimmed,
        status: 'active',
      };
      await dataStore.routines.put(routine);
      await reload();
    },
    [reload],
  );

  const removeRoutine = useCallback(
    async (id: string) => {
      await dataStore.routines.softDelete(id);
      await reload();
    },
    [reload],
  );

  return { routines, loading, addRoutine, removeRoutine };
}
