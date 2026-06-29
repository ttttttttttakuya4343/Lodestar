// ドメイン型定義。
// 叩き台（CLAUDE_CODE_PHASE0.md 2.2）をそのまま採用。
// 案B（将来のクラウド同期）に備え、全レコードに共通フィールドを持たせる。

// すべてのレコードが持つ共通フィールド（案Bの同期に必須）
export interface BaseRecord {
  id: string; // UUID
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601（put のたびに更新）
  deleted: boolean; // 論理削除
}

export type EntityName =
  | 'settings'
  | 'emotionWords'
  | 'openWindow64'
  | 'starSheets'
  | 'routines'
  | 'dailyEntries'
  | 'weeklyEntries'
  | 'monthlyReflections';

// 設定（シングルトン: id='settings' 固定運用）
export interface Settings extends BaseRecord {
  theme: 'water-blue';
  startDate: string; // 利用開始日
  notificationsEnabled: boolean;
  lastSyncedAt: string | null; // 案Aでは常に null
}

export interface EmotionWord extends BaseRecord {
  label: string;
  isCustom: boolean;
}

// オープンウィンドウ64（未来思考編 / 実践思考編）
export interface OpenWindow64 extends BaseRecord {
  type: 'future' | 'practice';
  title: string;
  star: string[]; // 夢の実現で得られる感情
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
  date: string; // YYYY-MM-DD（自然キーだが id も保持）
  tasks: string[];
  good: string; // 今日のよかったこと
  redo: string; // 今日をもう一度やり直せるなら
  routineChecks: { routineId: string; done: boolean }[];
}

export interface WeeklyEntry extends BaseRecord {
  weekKey: string; // 例: 2026-W27
  weekTasks: string[];
  targetEmotions: string[]; // 今週感じたいプラス感情
}

export interface MonthlyReflection extends BaseRecord {
  monthKey: string; // 例: 2026-06
  // Phase 3 で追加: 紙の「月間カレンダー」面の記入欄。1ヶ月=1レコード(id=monthKey)に集約。
  monthTasks: string[]; // 今月やること
  memo: string; // MEMO
  insights: string; // 今月の気付き
  // 習慣化ルーティンは streak から自動算出して表示する（保存しない）。
  // 叩き台の型は維持しつつ、案A では永続化せず常に [] を入れる。
  habituatedRoutines: string[];
}
