import { describe, it, expect } from 'vitest';
import { createLocalDataStore } from '../../data/local/localRepository';
import { makeDefaultSettings } from './useAppSettings';

describe('app settings (singleton)', () => {
  it('既定設定は id=settings で lastBackupAt は null', () => {
    const s = makeDefaultSettings();
    expect(s.id).toBe('settings');
    expect(s.theme).toBe('water-blue');
    expect(s.lastBackupAt).toBeNull();
    expect(s.lastSyncedAt).toBeNull();
  });

  it('lastBackupAt を保存して読み戻せる', async () => {
    const store = createLocalDataStore();
    const ts = '2026-06-29T01:00:00.000Z';
    await store.settings.put({ ...makeDefaultSettings(), lastBackupAt: ts });
    const loaded = await store.settings.getById('settings');
    expect(loaded?.lastBackupAt).toBe(ts);
  });
});
