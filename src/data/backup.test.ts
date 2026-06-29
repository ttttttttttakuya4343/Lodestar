import { describe, it, expect } from 'vitest';
import {
  backupFileName,
  isBackupData,
  shouldOverwrite,
  type BackupData,
} from './backup';
import { createLocalDataStore } from './local/localRepository';
import type { Routine } from '../domain/types';

function emptyBackup(): BackupData {
  return {
    app: 'lodestar',
    version: 1,
    exportedAt: '2026-06-29T00:00:00.000Z',
    data: {
      settings: [],
      emotionWords: [],
      openWindow64: [],
      starSheets: [],
      routines: [],
      dailyEntries: [],
      weeklyEntries: [],
      monthlyReflections: [],
    },
  };
}

function routine(id: string, name: string, updatedAt: string): Routine {
  return {
    id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt,
    deleted: false,
    name,
    status: 'active',
  };
}

describe('backup pure helpers', () => {
  it('isBackupData は形を検証する', () => {
    expect(isBackupData(emptyBackup())).toBe(true);
    expect(isBackupData(null)).toBe(false);
    expect(isBackupData({ app: 'other', data: {} })).toBe(false);
    // 1テーブル欠けると無効
    const broken = emptyBackup() as unknown as Record<string, unknown>;
    delete (broken.data as Record<string, unknown>).routines;
    expect(isBackupData(broken)).toBe(false);
  });

  it('shouldOverwrite は新しい updatedAt を採用', () => {
    expect(shouldOverwrite(undefined, '2026-01-01T00:00:00.000Z')).toBe(true);
    expect(
      shouldOverwrite('2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'),
    ).toBe(true);
    expect(
      shouldOverwrite('2026-01-02T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
    ).toBe(false);
  });

  it('backupFileName は日付入りの .json', () => {
    expect(backupFileName(new Date(2026, 5, 29))).toBe(
      'lodestar-backup-2026-06-29.json',
    );
  });
});

describe('export / import 往復', () => {
  it('replace は全消去して取り込む', async () => {
    const store = createLocalDataStore();
    const backup = emptyBackup();
    backup.data.routines = [routine('r-rep', '新ルーティン', '2026-01-02T00:00:00.000Z')];
    await store.importAll(backup, 'replace');

    const dump = await store.exportAll();
    expect(dump.data.routines.find((r) => r.id === 'r-rep')?.name).toBe(
      '新ルーティン',
    );

    // 空で replace すると消える
    await store.importAll(emptyBackup(), 'replace');
    expect((await store.exportAll()).data.routines).toEqual([]);
  });

  it('merge は updatedAt の新しい方を残す', async () => {
    const store = createLocalDataStore();
    const base = emptyBackup();
    base.data.routines = [routine('r-mrg', 'new', '2026-01-02T00:00:00.000Z')];
    await store.importAll(base, 'replace');

    // 古いレコードを merge → 上書きされない
    const older = emptyBackup();
    older.data.routines = [routine('r-mrg', 'old', '2026-01-01T00:00:00.000Z')];
    await store.importAll(older, 'merge');
    expect(await store.routines.getById('r-mrg')).toMatchObject({ name: 'new' });

    // 新しいレコードを merge → 上書きされる
    const newer = emptyBackup();
    newer.data.routines = [routine('r-mrg', 'newer', '2026-01-03T00:00:00.000Z')];
    await store.importAll(newer, 'merge');
    expect(await store.routines.getById('r-mrg')).toMatchObject({ name: 'newer' });
  });
});
