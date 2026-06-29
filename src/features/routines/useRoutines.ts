import { useCallback, useEffect, useState } from 'react';
import type { Routine } from '../../domain/types';
import { dataStore } from '../../data';
import { newId, nowIso } from '../../domain/ids';

// ルーティン管理: アクティブ/アーカイブ済みの取得・追加・アーカイブ・削除。
// 連続/累計の算出は streak.ts（純粋）＋ useRoutineStats が担当する。
export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]); // active
  const [archived, setArchived] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await dataStore.routines.getAll(); // deleted=false のみ
    setRoutines(all.filter((r) => r.status === 'active'));
    setArchived(all.filter((r) => r.status === 'archived'));
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

  // 習慣化したルーティンを履歴に残す（物理削除はしない）。
  const archiveRoutine = useCallback(
    async (id: string) => {
      const r = await dataStore.routines.getById(id);
      if (!r) return;
      await dataStore.routines.put({
        ...r,
        status: 'archived',
        archivedAt: nowIso(),
      });
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

  return {
    routines,
    archived,
    loading,
    addRoutine,
    archiveRoutine,
    removeRoutine,
  };
}
