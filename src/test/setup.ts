// Vitest セットアップ: Node 環境に IndexedDB を注入し、Dexie を動作させる。
import 'fake-indexeddb/auto';

// 同期の watermark（localStorage）テスト用の最小ポリフィル。
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  const shim: Storage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  globalThis.localStorage = shim;
}
