# Lodestar

原田メソッド「STAR PLANNER（目標達成ノート）」を自分専用でデジタル化する、
スマホ向けの PWA（Web アプリ）です。「導きの星」を意味する Lodestar が名前の由来。

> 仕様の出発点は [`REQUIREMENTS.md`](./REQUIREMENTS.md)、
> Phase 0 の指示・叩き台は [`CLAUDE_CODE_PHASE0.md`](./CLAUDE_CODE_PHASE0.md) を参照。

## 現在の状態: Phase 0（土台づくり）完了

機能（日次ジャーナル等）はまだ未実装。Phase 1 以降を見据えた土台と、
差し替え可能なデータ層のみを用意しています。

## 技術スタック

- React + TypeScript（strict）+ Vite
- Tailwind CSS v3（水色×ミニマル。配色は CSS 変数 `src/styles/tokens.css` で一元管理）
- IndexedDB（Dexie.js）でローカル保存。サーバーには一切送信しない（案A）
- vite-plugin-pwa（manifest + Service Worker、オフライン起動・ホーム画面追加対応）

## セットアップ

```bash
npm install
cp .env.example .env   # 任意。案A では VITE_API_BASE_URL は空のままでよい
```

## npm スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動（http://localhost:5173） |
| `npm run build` | 型チェック（tsc）→ 本番ビルド（dist/） |
| `npm run preview` | ビルド成果物をローカルプレビュー |
| `npm test` | スモークテスト（Vitest + fake-indexeddb） |
| `npm run test:watch` | テストの watch モード |

## ディレクトリ構成

```
src/
  main.tsx
  App.tsx                 # ボトムナビによるタブ切替（useState、依存なし）
  domain/
    types.ts              # ドメイン型（共通フィールド + 各エンティティ）
    ids.ts                # UUID / 日付・週・月キー生成
  data/
    repository.ts         # Repository インターフェース（抽象）
    index.ts              # ファクトリ: env を見て Local/Remote を返す（今は Local 固定）
    local/
      db.ts               # Dexie 定義（テーブル・インデックス）
      localRepository.ts  # Repository の IndexedDB 実装
      localRepository.test.ts # スモークテスト
  features/               # Phase 1 以降の画面はここに追加
    today/ week/ month/ goals/ settings/
  components/
    BottomNav.tsx         # ボトムナビ（今日/週/月/目標/設定）
    ScreenScaffold.tsx    # 画面共通レイアウト
  styles/
    tokens.css            # デザイントークン（CSS 変数）
  test/
    setup.ts              # Vitest: fake-indexeddb 注入
public/                   # PWA アイコン・favicon
```

## 設計方針（案A → 案B への拡張に備える）

1. **データ層は Repository インターフェース越し**。UI 層は保存先（ローカル/リモート）を知らない。
   今は `LocalRepository`（IndexedDB）のみ。将来 `RemoteRepository` を足すだけで同期に対応できる。
2. **全レコードに共通フィールド** `id` / `createdAt` / `updatedAt` / `deleted`。
   削除は物理削除せず `deleted=true`（論理削除）。
3. **API ベース URL は環境変数** `VITE_API_BASE_URL`。空なら案A（ローカルのみ）、
   値が入れば案B（同期）に切り替わる想定（`src/data/index.ts`）。
4. 業務データは IndexedDB のみに保存。localStorage / sessionStorage には置かない。

## PWA について

`vite-plugin-pwa` が manifest と Service Worker を生成します。`npm run build` 後の
`dist/` を HTTPS 配信すればホーム画面に追加でき、オフライン起動できます。
開発時も `devOptions.enabled` で SW が有効なため、インストール可否を確認できます。
