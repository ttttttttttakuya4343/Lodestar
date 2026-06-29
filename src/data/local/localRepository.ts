// Repository の IndexedDB 実装（Dexie）。
// 1つの汎用クラスで全エンティティを賄い、createLocalDataStore() で DataStore を組み立てる。
import type { Table } from 'dexie';
import type { BaseRecord } from '../../domain/types';
import type { DataStore, Repository } from '../repository';
import type { BackupData, ImportMode } from '../backup';
import { shouldOverwrite } from '../backup';
import { nowIso } from '../../domain/ids';
import { db } from './db';

/** Dexie テーブルを 1 つ受け取り、Repository<T> 契約を満たす汎用実装。 */
class LocalRepository<T extends BaseRecord> implements Repository<T> {
  constructor(private readonly table: Table<T, string>) {}

  async getAll(): Promise<T[]> {
    // deleted は boolean のためインデックスではなく filter で除外（db.ts のコメント参照）。
    return this.table.filter((r) => !r.deleted).toArray();
  }

  async getById(id: string): Promise<T | undefined> {
    const record = await this.table.get(id);
    // 論理削除済みは存在しない扱いにする。
    if (!record || record.deleted) return undefined;
    return record;
  }

  async put(record: T): Promise<T> {
    // upsert のたびに updatedAt を更新（案Bの差分同期で last-write-wins の基準になる）。
    const next: T = { ...record, updatedAt: nowIso() };
    await this.table.put(next);
    return next;
  }

  async softDelete(id: string): Promise<void> {
    const record = await this.table.get(id);
    if (!record) return;
    const next: T = { ...record, deleted: true, updatedAt: nowIso() };
    await this.table.put(next);
  }

  async getChangedSince(iso: string): Promise<T[]> {
    // 案B（同期）用。updatedAt が iso より後のものを返す（deleted も含める＝削除伝播のため）。
    return this.table.where('updatedAt').above(iso).toArray();
  }
}

// 全テーブル（バックアップ対象）。トランザクション範囲と一括処理で共用。
const ALL_TABLES = [
  db.settings,
  db.emotionWords,
  db.openWindow64,
  db.starSheets,
  db.routines,
  db.dailyEntries,
  db.weeklyEntries,
  db.monthlyReflections,
];

/** 1テーブル分の取り込み。replace は全消去後に投入、merge は updatedAt の新しい方を採用。 */
async function importTable<T extends BaseRecord>(
  table: Table<T, string>,
  records: T[],
  mode: ImportMode,
): Promise<void> {
  if (mode === 'replace') {
    await table.clear();
    await table.bulkPut(records);
    return;
  }
  for (const rec of records) {
    const existing = await table.get(rec.id);
    if (shouldOverwrite(existing?.updatedAt, rec.updatedAt)) {
      await table.put(rec);
    }
  }
}

/** IndexedDB を保存先とする DataStore を生成。 */
export function createLocalDataStore(): DataStore {
  return {
    settings: new LocalRepository(db.settings),
    emotionWords: new LocalRepository(db.emotionWords),
    openWindow64: new LocalRepository(db.openWindow64),
    starSheets: new LocalRepository(db.starSheets),
    routines: new LocalRepository(db.routines),
    dailyEntries: new LocalRepository(db.dailyEntries),
    weeklyEntries: new LocalRepository(db.weeklyEntries),
    monthlyReflections: new LocalRepository(db.monthlyReflections),

    // 論理削除済みも含めた完全ダンプ（tombstone を保持）。
    async exportAll(): Promise<BackupData> {
      return {
        app: 'lodestar',
        version: 1,
        exportedAt: nowIso(),
        data: {
          settings: await db.settings.toArray(),
          emotionWords: await db.emotionWords.toArray(),
          openWindow64: await db.openWindow64.toArray(),
          starSheets: await db.starSheets.toArray(),
          routines: await db.routines.toArray(),
          dailyEntries: await db.dailyEntries.toArray(),
          weeklyEntries: await db.weeklyEntries.toArray(),
          monthlyReflections: await db.monthlyReflections.toArray(),
        },
      };
    },

    async importAll(backup: BackupData, mode: ImportMode): Promise<void> {
      // 全テーブルを1トランザクションで処理し、途中失敗時はロールバックする。
      await db.transaction('rw', ALL_TABLES, async () => {
        await importTable(db.settings, backup.data.settings, mode);
        await importTable(db.emotionWords, backup.data.emotionWords, mode);
        await importTable(db.openWindow64, backup.data.openWindow64, mode);
        await importTable(db.starSheets, backup.data.starSheets, mode);
        await importTable(db.routines, backup.data.routines, mode);
        await importTable(db.dailyEntries, backup.data.dailyEntries, mode);
        await importTable(db.weeklyEntries, backup.data.weeklyEntries, mode);
        await importTable(
          db.monthlyReflections,
          backup.data.monthlyReflections,
          mode,
        );
      });
    },
  };
}
