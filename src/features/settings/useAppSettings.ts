import { useCallback, useEffect, useState } from 'react';
import type { Settings } from '../../domain/types';
import { dataStore } from '../../data';
import { dateKey, nowIso } from '../../domain/ids';

// 設定はシングルトン（id='settings' 固定）。
const SETTINGS_ID = 'settings';

export function makeDefaultSettings(): Settings {
  const ts = nowIso();
  return {
    id: SETTINGS_ID,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    theme: 'water-blue',
    startDate: dateKey(),
    notificationsEnabled: false,
    lastSyncedAt: null,
    lastBackupAt: null,
  };
}

// アプリ設定（シングルトン）の取得と更新。今は最終バックアップ日時の記録に使う。
export function useAppSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  const reload = useCallback(async () => {
    const found = await dataStore.settings.getById(SETTINGS_ID);
    setSettings(found ?? makeDefaultSettings());
  }, []);

  useEffect(() => {
    let active = true;
    void reload().finally(() => {
      if (!active) return;
    });
    return () => {
      active = false;
    };
  }, [reload]);

  // エクスポート成功時に呼ぶ。最終バックアップ日時を保存する。
  const markBackedUp = useCallback(async () => {
    const current =
      (await dataStore.settings.getById(SETTINGS_ID)) ?? makeDefaultSettings();
    const next = await dataStore.settings.put({
      ...current,
      lastBackupAt: nowIso(),
    });
    setSettings(next);
  }, []);

  return { settings, markBackedUp };
}
