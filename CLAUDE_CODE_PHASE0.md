# Claude Code 引き継ぎ資料 — Phase 0（土台づくり）

このファイルは `REQUIREMENTS.md` の **Phase 0** を Claude Code に実装してもらうための
「最初の指示文」と「叩き台」をまとめたものです。
`REQUIREMENTS.md` と本ファイルを同じリポジトリに置き、下の指示文を Claude Code に渡してください。

---

## 1. 最初の指示文（このままコピペで渡す）

````
あなたはこのリポジトリの実装担当です。まず同梱の REQUIREMENTS.md を読んでください。
これは「STAR PLANNER（原田メソッドの目標達成ノート）」を自分専用でデジタル化する、
スマホ向けの PWA（Web アプリ）です。アプリ名は「Lodestar」（PWA の表示名・manifest の name に使用）。

今回のタスクは「Phase 0（土台づくり）」だけです。機能（日次ジャーナル等）はまだ作りません。
Phase 1 以降を見据えた、きれいな土台と差し替え可能なデータ層を用意するのがゴールです。

【技術スタック（REQUIREMENTS.md 第8章）】
- React + TypeScript（strict）+ Vite
- Tailwind CSS（デザインは「水色×ミニマル」: 白基調＋淡い水色アクセント、余白広め、装飾控えめ）
- IndexedDB（Dexie.js）でローカル保存
- vite-plugin-pwa（manifest + Service Worker、オフライン起動・ホーム画面追加対応）
- バックエンド/認証なし（案A）。サーバーには一切送信しない。

【最重要の設計ルール（案B＝将来のクラウド同期に備える）】
1. データアクセスは必ず Repository インターフェース越しに行う。
   UI 層は保存先（ローカルかリモートか）を一切知らない。
   今回は LocalRepository（IndexedDB 実装）のみ作る。将来 RemoteRepository を足すだけで
   同期に対応できる構造にする。
2. 全レコードに共通フィールド id / createdAt / updatedAt / deleted を持たせる。
   削除は物理削除せず deleted=true（論理削除）。
3. API のベース URL は環境変数 VITE_API_BASE_URL で扱う。今は空（＝ローカルのみ）。
4. 本ファイル「2. 叩き台」のディレクトリ構成・型・インターフェースを出発点にする。
   改善する場合は理由をコメントで残すこと。

【Phase 0 の成果物（これを作る）】
- Vite + React + TS + Tailwind のプロジェクト雛形（strict 設定）
- vite-plugin-pwa の設定（manifest、アイコン仮置き、オフライン対応）
- 「2. 叩き台」のディレクトリ構成
- ドメイン型定義（src/domain/types.ts）
- Repository インターフェース（src/data/repository.ts）と
  Dexie による LocalRepository 実装（src/data/local/*）
- 保存先を環境変数で切り替えるファクトリ（src/data/index.ts。今は Local 固定）
- ボトムナビ（今日 / 週 / 月 / 目標 / 設定）と各タブのプレースホルダ画面
- Tailwind のデザイントークン（水色パレット・余白・角丸）を tailwind.config と CSS 変数で定義
- 開発・ビルド・プレビュー用 npm script、簡潔な README

【制約】
- モバイル縦画面ファースト。片手操作を意識（タップ領域大きめ）。
- TypeScript strict、any 禁止（やむを得ない箇所はコメントで理由）。
- localStorage/sessionStorage に業務データを置かない（保存は IndexedDB）。

【完了条件（受け入れ基準）】
- `npm run dev` でローカル起動し、ボトムナビでタブ切替できる。
- `npm run build` が型エラーなく通る。
- PWA としてインストール可能（manifest/SW が有効）。
- スモークテスト: 開発時に DailyEntry を1件 Repository 経由で put → getById で読み戻せる
  （簡単な動作確認コードか最小テストでよい）。

大きな方針変更が必要だと判断したら、勝手に進めず先に提案してください。
まず実装計画（作成/変更するファイル一覧）を提示し、合意後にコードを書いてください。
````

---

## 2. 叩き台

### 2.1 ディレクトリ構成（推奨）

```
src/
  main.tsx
  App.tsx
  domain/
    types.ts            # ドメイン型（共通フィールド + 各エンティティ）
    ids.ts              # UUID/日付キー生成ユーティリティ
  data/
    repository.ts       # Repository インターフェース（抽象）
    index.ts            # ファクトリ: env を見て Local/Remote を返す（今は Local 固定）
    local/
      db.ts             # Dexie 定義（テーブル・インデックス）
      localRepository.ts# Repository の IndexedDB 実装
  features/             # Phase 1 以降の画面はここに追加
    today/  TodayScreen.tsx
    week/   WeekScreen.tsx
    month/  MonthScreen.tsx
    goals/  GoalsScreen.tsx
    settings/ SettingsScreen.tsx
  components/
    BottomNav.tsx
  styles/
    tokens.css          # デザイントークン（CSS 変数）
  pwa/                  # manifest 用アイコン等
```

### 2.2 ドメイン型（`src/domain/types.ts` の叩き台）

```ts
// すべてのレコードが持つ共通フィールド（案Bの同期に必須）
export interface BaseRecord {
  id: string;          // UUID
  createdAt: string;   // ISO8601
  updatedAt: string;   // ISO8601（put のたびに更新）
  deleted: boolean;    // 論理削除
}

export type EntityName =
  | 'settings' | 'emotionWords' | 'openWindow64' | 'starSheets'
  | 'routines' | 'dailyEntries' | 'weeklyEntries' | 'monthlyReflections';

// 設定（シングルトン: id='settings' 固定運用）
export interface Settings extends BaseRecord {
  theme: 'water-blue';
  startDate: string;            // 利用開始日
  notificationsEnabled: boolean;
  lastSyncedAt: string | null;  // 案Aでは常に null
}

export interface EmotionWord extends BaseRecord {
  label: string;
  isCustom: boolean;
}

// オープンウィンドウ64（未来思考編 / 実践思考編）
export interface OpenWindow64 extends BaseRecord {
  type: 'future' | 'practice';
  title: string;
  star: string[];               // 夢の実現で得られる感情
  // 9ブロック。各ブロックは中心ラベル + 周囲8マス
  blocks: { center: string; cells: string[] /* length 8 */ }[]; // length 9
}

// スターシート（STEP1〜5）
export interface StarSheet extends BaseRecord {
  title: string;
  step1: { home: string; work: string };
  step2: {
    socialTangible: string[];
    socialIntangible: string[];
    selfTangible: string[];
    selfIntangible: string[];
  };
  step3: { positiveSentence: string };
  step4: {
    routines: string[];
    milestones: { text: string; dueDate: string }[];
  };
  step5: { strokes: { from: string; content: string }[] };
}

export interface Routine extends BaseRecord {
  name: string;
  emotionTag?: string;
  status: 'active' | 'archived';
  archivedAt?: string;
}

export interface DailyEntry extends BaseRecord {
  date: string;                 // YYYY-MM-DD（自然キーだが id も保持）
  tasks: string[];
  good: string;                 // 今日のよかったこと
  redo: string;                 // 今日をもう一度やり直せるなら
  routineChecks: { routineId: string; done: boolean }[];
}

export interface WeeklyEntry extends BaseRecord {
  weekKey: string;              // 例: 2026-W27
  weekTasks: string[];
  targetEmotions: string[];     // 今週感じたいプラス感情
}

export interface MonthlyReflection extends BaseRecord {
  monthKey: string;             // 例: 2026-06
  insights: string;            // 今月の気付き
  habituatedRoutines: string[];// 今月習慣化できたルーティン行動
}
```

### 2.3 Repository インターフェース（`src/data/repository.ts` の叩き台）

```ts
import type { BaseRecord } from '../domain/types';

// 1エンティティ分の汎用 CRUD。保存先に依存しない契約。
export interface Repository<T extends BaseRecord> {
  getAll(): Promise<T[]>;                 // deleted=false のみ返す
  getById(id: string): Promise<T | undefined>;
  put(record: T): Promise<T>;             // upsert。updatedAt を更新して返す
  softDelete(id: string): Promise<void>;  // deleted=true に
  // 将来の同期用（案Bで使用。案Aでは未使用でも定義だけしておく）
  getChangedSince?(iso: string): Promise<T[]>;
}

// アプリ全体のデータ窓口。UI はこれだけ見る。
export interface DataStore {
  settings: Repository<import('../domain/types').Settings>;
  emotionWords: Repository<import('../domain/types').EmotionWord>;
  openWindow64: Repository<import('../domain/types').OpenWindow64>;
  starSheets: Repository<import('../domain/types').StarSheet>;
  routines: Repository<import('../domain/types').Routine>;
  dailyEntries: Repository<import('../domain/types').DailyEntry>;
  weeklyEntries: Repository<import('../domain/types').WeeklyEntry>;
  monthlyReflections: Repository<import('../domain/types').MonthlyReflection>;
}
```

### 2.4 ファクトリ（`src/data/index.ts` の叩き台）

```ts
import type { DataStore } from './repository';
import { createLocalDataStore } from './local/localRepository';

// 環境変数が空（案A）なら Local。将来 VITE_API_BASE_URL が入れば Remote に差し替える。
export function createDataStore(): DataStore {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  if (apiBase) {
    // Phase 7（案B）で実装。例: return createRemoteDataStore(apiBase);
    throw new Error('RemoteDataStore is not implemented yet (Phase 7).');
  }
  return createLocalDataStore();
}
```

### 2.5 Dexie 定義（`src/data/local/db.ts` の叩き台）

```ts
import Dexie, { type Table } from 'dexie';
import type {
  Settings, EmotionWord, OpenWindow64, StarSheet,
  Routine, DailyEntry, WeeklyEntry, MonthlyReflection,
} from '../../domain/types';

export class AppDB extends Dexie {
  settings!: Table<Settings, string>;
  emotionWords!: Table<EmotionWord, string>;
  openWindow64!: Table<OpenWindow64, string>;
  starSheets!: Table<StarSheet, string>;
  routines!: Table<Routine, string>;
  dailyEntries!: Table<DailyEntry, string>;
  weeklyEntries!: Table<WeeklyEntry, string>;
  monthlyReflections!: Table<MonthlyReflection, string>;

  constructor() {
    super('lodestar');
    // updatedAt / deleted は同期・一覧取得用に索引化
    this.version(1).stores({
      settings: 'id, updatedAt, deleted',
      emotionWords: 'id, updatedAt, deleted',
      openWindow64: 'id, type, updatedAt, deleted',
      starSheets: 'id, updatedAt, deleted',
      routines: 'id, status, updatedAt, deleted',
      dailyEntries: 'id, date, updatedAt, deleted',
      weeklyEntries: 'id, weekKey, updatedAt, deleted',
      monthlyReflections: 'id, monthKey, updatedAt, deleted',
    });
  }
}

export const db = new AppDB();
```

### 2.6 デザイントークン（`tailwind.config` / `tokens.css` の叩き台）

```css
/* src/styles/tokens.css — 水色×ミニマル */
:root {
  --color-bg: #ffffff;
  --color-surface: #f7fafd;
  --color-accent: #5cc6e8;   /* 淡い水色（STAR PLANNER 風） */
  --color-accent-weak: #d7eef8;
  --color-text: #2b2f33;
  --color-text-weak: #6b7280;
  --color-line: #e6edf2;
  --radius: 14px;
  --space: 16px;             /* 余白は広めを基本に */
}
```

```js
// tailwind.config.js（抜粋）
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--color-accent)',
        'accent-weak': 'var(--color-accent-weak)',
        surface: 'var(--color-surface)',
        line: 'var(--color-line)',
      },
      borderRadius: { card: 'var(--radius)' },
    },
  },
};
```

---

## 3. 渡し方のコツ

- まず指示文を渡し、Claude Code に「実装計画（作成/変更ファイル一覧）」を出させてから着手させると、暴走を防げます。
- Phase 0 が動いたら、同じ要領で「次は Phase 1（日次ジャーナル＋ルーティンチェック）を REQUIREMENTS.md に沿って」と渡せば続けられます。
- 叩き台はあくまで出発点です。Claude Code がより良い形に直した場合は、理由を一緒に確認してください。
