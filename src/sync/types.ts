import type { BaseRecord, EntityName } from '../domain/types';

// ネットワーク上のレコード表現＝エンティティ種別を併せ持つ共通レコード。
export type RemoteRecord = { entityType: EntityName } & BaseRecord;

// サーバ API の契約（実装は remoteClient、テストではモックを注入）。
export interface RemoteApi {
  fetchChanges(
    since: string,
  ): Promise<{ records: RemoteRecord[]; serverTime: string }>;
  pushChanges(
    records: RemoteRecord[],
  ): Promise<{ applied: number; serverTime: string }>;
}
