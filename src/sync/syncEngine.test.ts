import { describe, it, expect, beforeEach } from 'vitest';
import { createSyncEngine, groupByEntity } from './syncEngine';
import { setLastSynced } from './watermark';
import { createLocalDataStore } from '../data/local/localRepository';
import { newId, nowIso } from '../domain/ids';
import type { RemoteApi, RemoteRecord } from './types';
import type { Routine } from '../domain/types';

function routineRecord(id: string, name: string, updatedAt: string): Routine {
  return {
    id,
    createdAt: updatedAt,
    updatedAt,
    deleted: false,
    name,
    status: 'active',
  };
}

describe('groupByEntity', () => {
  it('フラットなレコードをエンティティ別にまとめ entityType を除く', () => {
    const recs: RemoteRecord[] = [
      { entityType: 'routines', ...routineRecord('r1', 'A', nowIso()) },
    ];
    const backup = groupByEntity(recs);
    expect(backup.data.routines).toHaveLength(1);
    expect(backup.data.routines[0]?.name).toBe('A');
    expect(
      (backup.data.routines[0] as unknown as { entityType?: string }).entityType,
    ).toBeUndefined();
  });
});

describe('syncEngine.sync', () => {
  beforeEach(() => {
    setLastSynced('1970-01-01T00:00:00.000Z');
  });

  it('ローカル差分を push し、リモート差分を pull してローカルへ反映する', async () => {
    const store = createLocalDataStore();

    // ローカルに1件（put が updatedAt を付与）
    const localRoutine = await store.routines.put(
      routineRecord(newId(), 'ローカル', nowIso()),
    );

    // リモートが返す1件
    const remoteId = newId();
    const remoteRecord: RemoteRecord = {
      entityType: 'routines',
      ...routineRecord(remoteId, 'リモート', '2999-01-01T00:00:00.000Z'),
    };

    const pushed: RemoteRecord[] = [];
    const fakeRemote: RemoteApi = {
      async pushChanges(records) {
        pushed.push(...records);
        return { applied: records.length, serverTime: '2999-01-02T00:00:00.000Z' };
      },
      async fetchChanges() {
        return {
          records: [remoteRecord],
          serverTime: '2999-01-02T00:00:00.000Z',
        };
      },
    };

    const engine = createSyncEngine({ store, remote: fakeRemote });
    const result = await engine.sync();

    // push にローカルの変更が含まれる
    expect(result.pushed).toBe(1);
    expect(pushed.some((r) => r.id === localRoutine.id)).toBe(true);

    // pull したリモートレコードがローカルに反映される
    expect(result.pulled).toBe(1);
    const loaded = await store.routines.getById(remoteId);
    expect(loaded?.name).toBe('リモート');
    // updatedAt は保持される（put で上書きしない）
    expect(loaded?.updatedAt).toBe('2999-01-01T00:00:00.000Z');
  });

  it('last-write-wins: 古いリモートはローカルを上書きしない', async () => {
    const store = createLocalDataStore();
    const id = newId();
    // ローカルは新しい
    await store.routines.put(routineRecord(id, '新ローカル', '2999-12-31T00:00:00.000Z'));

    const fakeRemote: RemoteApi = {
      async pushChanges(records) {
        return { applied: records.length, serverTime: nowIso() };
      },
      async fetchChanges() {
        return {
          records: [
            { entityType: 'routines', ...routineRecord(id, '旧リモート', '2000-01-01T00:00:00.000Z') },
          ],
          serverTime: nowIso(),
        };
      },
    };

    await createSyncEngine({ store, remote: fakeRemote }).sync();
    const loaded = await store.routines.getById(id);
    expect(loaded?.name).toBe('新ローカル'); // 上書きされない
  });
});
