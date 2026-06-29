import { useCallback, useEffect, useState } from 'react';
import type { BaseRecord } from '../domain/types';
import type { Repository } from '../data/repository';
import { useDebouncedCallback } from './useDebouncedCallback';

// 自然キー(id=weekKey/monthKey 等)で1レコードを取得・編集・debounce 自動保存する汎用フック。
// 未保存なら makeEmpty で空ドラフトを保持し、編集が入るまで DB へは書かない。
// （Phase 1 の useDailyEntry と同じ方針を週/月ビューでも再利用するための一般化）
export function useKeyedRecord<T extends BaseRecord>(
  repo: Repository<T>,
  id: string,
  makeEmpty: (id: string) => T,
) {
  const [record, setRecord] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void repo.getById(id).then((found) => {
      if (!active) return;
      setRecord(found ?? makeEmpty(id));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [repo, id, makeEmpty]);

  const save = useDebouncedCallback((next: T) => {
    void repo.put(next);
  }, 500);

  const apply = useCallback(
    (producer: (prev: T) => T) => {
      setRecord((prev) => {
        if (!prev) return prev;
        const next = producer(prev);
        if (next === prev) return prev;
        save(next);
        return next;
      });
    },
    [save],
  );

  return { record, loading, apply };
}
