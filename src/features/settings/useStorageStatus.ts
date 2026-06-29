import { useEffect, useState } from 'react';
import { isPersisted, storageEstimate } from '../../lib/storage';

// ストレージの永続化状態と使用量を読み取る（表示用）。
export function useStorageStatus() {
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [estimate, setEstimate] = useState<{
    usage: number;
    quota: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    void isPersisted().then((p) => {
      if (active) setPersisted(p);
    });
    void storageEstimate().then((e) => {
      if (active) setEstimate(e);
    });
    return () => {
      active = false;
    };
  }, []);

  return { persisted, estimate };
}
