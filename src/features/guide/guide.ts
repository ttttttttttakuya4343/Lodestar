// 使い方ガイドの「次回から表示しない」フラグ（端末ローカル）。
// 業務データではない UI 設定なので localStorage に保持し、同期対象には含めない。
const KEY = 'lodestar.guideDismissed';

export function isGuideDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setGuideDismissed(dismissed: boolean): void {
  try {
    if (dismissed) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // localStorage 不可の環境では保持できないが致命的ではない
  }
}
