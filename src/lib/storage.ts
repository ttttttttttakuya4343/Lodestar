// ブラウザのストレージ永続化と使用量の薄いラッパ（未対応環境でも安全に動く）。

/** 永続化を要求し、結果（許可されたか）を返す。未対応なら false。 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}

/** 既に永続化されているか。未対応なら false。 */
export async function isPersisted(): Promise<boolean> {
  if (!navigator.storage?.persisted) return false;
  return navigator.storage.persisted();
}

/** おおよその使用量/割当（バイト）。未対応なら null。 */
export async function storageEstimate(): Promise<{
  usage: number;
  quota: number;
} | null> {
  if (!navigator.storage?.estimate) return null;
  const e = await navigator.storage.estimate();
  return { usage: e.usage ?? 0, quota: e.quota ?? 0 };
}

/** バイト数を読みやすい単位に整形。 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

/** 前回バックアップから days 日以上経過（または未実施）なら true。 */
export function isBackupStale(
  lastBackupAt: string | null,
  now: Date = new Date(),
  days = 14,
): boolean {
  if (!lastBackupAt) return true;
  const last = new Date(lastBackupAt).getTime();
  if (Number.isNaN(last)) return true;
  return now.getTime() - last >= days * 24 * 60 * 60 * 1000;
}
