// Repository の IndexedDB 実装（Dexie）。
// 1つの汎用クラスで全エンティティを賄い、createLocalDataStore() で DataStore を組み立てる。
import type { Table } from 'dexie';
import type { BaseRecord } from '../../domain/types';
import type { DataStore, Repository } from '../repository';
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
  };
}
