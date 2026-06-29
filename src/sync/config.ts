// 同期の設定（ビルド時環境変数から）。すべて揃って初めて同期が有効。
export const syncConfig = {
  apiBase: import.meta.env.VITE_API_BASE_URL ?? '',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',
  region: import.meta.env.VITE_AWS_REGION ?? '',
};

export function isSyncConfigured(): boolean {
  return Boolean(
    syncConfig.apiBase && syncConfig.userPoolId && syncConfig.clientId,
  );
}
