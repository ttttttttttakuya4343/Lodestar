import { useEffect, useState } from 'react';
import { dataStore } from '../../data';
import type { SearchData } from './search';

// 検索対象（日次/週/月/ルーティン）をまとめて読み込む。検索オーバーレイで使用。
export function useSearchData() {
  const [data, setData] = useState<SearchData>({
    daily: [],
    weekly: [],
    monthly: [],
    routines: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      dataStore.dailyEntries.getAll(),
      dataStore.weeklyEntries.getAll(),
      dataStore.monthlyReflections.getAll(),
      dataStore.routines.getAll(),
    ]).then(([daily, weekly, monthly, routines]) => {
      if (!active) return;
      setData({ daily, weekly, monthly, routines });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}
