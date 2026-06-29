// データ層のファクトリ。
// 環境変数 VITE_API_BASE_URL が空（案A）なら Local。
// 将来値が入れば Remote（案B / Phase 7）に差し替える。UI は createDataStore() だけを呼ぶ。
import type { DataStore } from './repository';
import { createLocalDataStore } from './local/localRepository';

export function createDataStore(): DataStore {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  if (apiBase) {
    // Phase 7（案B）で実装。例: return createRemoteDataStore(apiBase);
    throw new Error('RemoteDataStore is not implemented yet (Phase 7).');
  }
  return createLocalDataStore();
}

// アプリ全体で共有する単一インスタンス。
export const dataStore: DataStore = createDataStore();

export type { DataStore, Repository } from './repository';
