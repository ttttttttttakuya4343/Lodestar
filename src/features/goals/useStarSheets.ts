import { useCallback, useEffect, useState } from 'react';
import type { StarSheet } from '../../domain/types';
import { dataStore } from '../../data';
import { newId } from '../../domain/ids';
import { emptyStarSheet } from './starsheet/starSheet';

// スターシート一覧の取得・新規作成・削除（論理削除）。更新日の新しい順。
export function useStarSheets() {
  const [sheets, setSheets] = useState<StarSheet[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await dataStore.starSheets.getAll();
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setSheets(all);
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

  // 空のシートを作成して id を返す（呼び出し側がそのままエディタを開く）。
  const create = useCallback(async (): Promise<string> => {
    const sheet = emptyStarSheet(newId());
    await dataStore.starSheets.put(sheet);
    await reload();
    return sheet.id;
  }, [reload]);

  const remove = useCallback(
    async (id: string) => {
      await dataStore.starSheets.softDelete(id);
      await reload();
    },
    [reload],
  );

  return { sheets, loading, create, remove, reload };
}
