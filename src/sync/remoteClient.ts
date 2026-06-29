// 実際のサーバ通信（RemoteApi 実装）。Cognito の ID トークンを Bearer で送る。
import { syncConfig } from './config';
import { idToken } from './auth';
import type { RemoteApi, RemoteRecord } from './types';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await idToken();
  if (!token) throw new Error('未ログインのため同期できません。');
  return {
    Authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
}

export const remoteClient: RemoteApi = {
  async fetchChanges(since) {
    const url = `${syncConfig.apiBase}/changes?since=${encodeURIComponent(since)}`;
    const res = await fetch(url, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`同期(pull)に失敗しました: ${res.status}`);
    return res.json() as Promise<{
      records: RemoteRecord[];
      serverTime: string;
    }>;
  },

  async pushChanges(records) {
    const res = await fetch(`${syncConfig.apiBase}/changes`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ records }),
    });
    if (!res.ok) throw new Error(`同期(push)に失敗しました: ${res.status}`);
    return res.json() as Promise<{ applied: number; serverTime: string }>;
  },
};
