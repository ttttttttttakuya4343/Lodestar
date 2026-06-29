// JSON バックアップのデータ形式と検証（保存先に依存しない）。
// REQUIREMENTS 7: エクスポート/インポートはバックアップ手段であり、案Bへの移行ブリッジでもある。
import type {
  Settings,
  EmotionWord,
  OpenWindow64,
  StarSheet,
  Routine,
  DailyEntry,
  WeeklyEntry,
  MonthlyReflection,
} from '../domain/types';

// バックアップは論理削除済み(deleted=true)レコードも含む完全ダンプ
// （tombstone を保つことで復元・将来の同期に支障が出ないようにする）。
export interface BackupData {
  app: 'lodestar';
  version: 1;
  exportedAt: string; // ISO8601
  data: {
    settings: Settings[];
    emotionWords: EmotionWord[];
    openWindow64: OpenWindow64[];
    starSheets: StarSheet[];
    routines: Routine[];
    dailyEntries: DailyEntry[];
    weeklyEntries: WeeklyEntry[];
    monthlyReflections: MonthlyReflection[];
  };
}

// replace: 既存を全消去して取り込み（バックアップからの復元）。
// merge:   id 単位で updatedAt の新しい方を採用（端末データの統合・last-write-wins）。
export type ImportMode = 'replace' | 'merge';

export const BACKUP_ENTITY_KEYS = [
  'settings',
  'emotionWords',
  'openWindow64',
  'starSheets',
  'routines',
  'dailyEntries',
  'weeklyEntries',
  'monthlyReflections',
] as const;

/** パース済みの未知データが BackupData かどうかを検証。 */
export function isBackupData(x: unknown): x is BackupData {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  if (o.app !== 'lodestar') return false;
  if (typeof o.data !== 'object' || o.data === null) return false;
  const d = o.data as Record<string, unknown>;
  return BACKUP_ENTITY_KEYS.every((k) => Array.isArray(d[k]));
}

/** merge 時、取り込みレコードで既存を上書きすべきか（新しい updatedAt が勝つ）。 */
export function shouldOverwrite(
  existingUpdatedAt: string | undefined,
  incomingUpdatedAt: string,
): boolean {
  if (existingUpdatedAt === undefined) return true;
  return incomingUpdatedAt >= existingUpdatedAt;
}

/** ダウンロード用のファイル名。 */
export function backupFileName(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `lodestar-backup-${y}-${m}-${d}.json`;
}
