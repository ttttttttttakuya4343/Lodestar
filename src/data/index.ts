// データ層のファクトリ。
// 設計改訂（Phase 7b）: 叩き台は「API URL があれば DataStore を Remote に差し替える」想定だったが、
// オフラインファースト要件（記入は常にローカルへ即保存）を満たすため、UI のデータ層は
// 常に Local（IndexedDB）とする。クラウド同期は別レイヤー（src/sync の SyncEngine）が担い、
// VITE_API_BASE_URL 等が揃ったときだけ有効化する。よってここで例外は投げない。
import type { DataStore } from './repository';
import { createLocalDataStore } from './local/localRepository';

export function createDataStore(): DataStore {
  return createLocalDataStore();
}

// アプリ全体で共有する単一インスタンス。
export const dataStore: DataStore = createDataStore();

export type { DataStore, Repository } from './repository';
