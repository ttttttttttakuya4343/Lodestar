// 同期の基準時刻（lastSyncedAt）は「端末ローカルに1つ保持」する（REQUIREMENTS 6）。
// これは同期のための装置（業務データではない）であり、かつ端末ごとに異なるべき値なので、
// 同期対象の Settings レコードには入れず localStorage に置く（同期で上書きし合わないように）。
const KEY = 'lodestar.lastSyncedAt';
const EPOCH = '1970-01-01T00:00:00.000Z';

export function getLastSynced(): string {
  try {
    return localStorage.getItem(KEY) ?? EPOCH;
  } catch {
    return EPOCH;
  }
}

export function setLastSynced(iso: string): void {
  try {
    localStorage.setItem(KEY, iso);
  } catch {
    // localStorage 不可の環境では同期基準を保持できないが致命的ではない
  }
}
