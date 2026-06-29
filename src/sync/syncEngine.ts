// 同期エンジン: ローカル(IndexedDB)を真実としつつ、サーバと差分同期する。
// UI はローカルだけを見て動き続け、ここが裏で push/pull する（ローカルファースト）。
import type { BaseRecord, EntityName } from '../domain/types';
import type { BackupData } from '../data/backup';
import type { DataStore, Repository } from '../data/repository';
import { nowIso } from '../domain/ids';
import { dataStore } from '../data';
import { getLastSynced, setLastSynced } from './watermark';
import type { RemoteApi, RemoteRecord } from './types';

function emptyData(): BackupData['data'] {
  return {
    settings: [],
    emotionWords: [],
    openWindow64: [],
    starSheets: [],
    routines: [],
    dailyEntries: [],
    weeklyEntries: [],
    monthlyReflections: [],
  };
}

// フラットなリモートレコード列を BackupData にまとめる（importAll で取り込む形）。
export function groupByEntity(records: RemoteRecord[]): BackupData {
  const data = emptyData();
  for (const r of records) {
    const { entityType, ...rest } = r;
    (data[entityType] as BaseRecord[]).push(rest as BaseRecord);
  }
  return { app: 'lodestar', version: 1, exportedAt: nowIso(), data };
}

// 1エンティティ分の「since 以降に変わったローカルレコード」を entityType 付きで返す。
async function changesFrom<T extends BaseRecord>(
  entityType: EntityName,
  repo: Repository<T>,
  since: string,
): Promise<RemoteRecord[]> {
  const changed = await repo.getChangedSince(since);
  return changed.map((rec) => ({ entityType, ...rec }));
}

async function collectLocalChanges(
  store: DataStore,
  since: string,
): Promise<RemoteRecord[]> {
  const groups = await Promise.all([
    changesFrom('settings', store.settings, since),
    changesFrom('emotionWords', store.emotionWords, since),
    changesFrom('openWindow64', store.openWindow64, since),
    changesFrom('starSheets', store.starSheets, since),
    changesFrom('routines', store.routines, since),
    changesFrom('dailyEntries', store.dailyEntries, since),
    changesFrom('weeklyEntries', store.weeklyEntries, since),
    changesFrom('monthlyReflections', store.monthlyReflections, since),
  ]);
  return groups.flat();
}

export interface SyncResult {
  pushed: number;
  pulled: number;
}

export interface SyncEngineDeps {
  store?: DataStore;
  remote: RemoteApi;
}

export function createSyncEngine({ store = dataStore, remote }: SyncEngineDeps) {
  // 1回の同期: 先にローカル差分を push（pull 前のスナップショットでエコーを避ける）、
  // 次にサーバ差分を pull して importAll(merge) で last-write-wins マージ。
  async function sync(): Promise<SyncResult> {
    const since = getLastSynced();

    const local = await collectLocalChanges(store, since);
    if (local.length > 0) await remote.pushChanges(local);

    const { records, serverTime } = await remote.fetchChanges(since);
    if (records.length > 0) {
      // importAll(merge) は updatedAt の新しい方を採用し、updatedAt を保ったまま書き込む。
      await store.importAll(groupByEntity(records), 'merge');
    }

    setLastSynced(serverTime);
    return { pushed: local.length, pulled: records.length };
  }

  return { sync };
}
