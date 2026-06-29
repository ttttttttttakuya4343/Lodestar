// 横断検索ロジック（純粋・テスト容易）。
// 対象は振り返り中心: 日次（よかったこと/やり直せるなら/タスク）、週、月、ルーティン名。
import type {
  DailyEntry,
  WeeklyEntry,
  MonthlyReflection,
  Routine,
} from '../../domain/types';

export interface SearchData {
  daily: DailyEntry[];
  weekly: WeeklyEntry[];
  monthly: MonthlyReflection[];
  routines: Routine[];
}

export interface SearchHit {
  id: string; // React キー用の一意 id
  kind: 'daily' | 'weekly' | 'monthly' | 'routine';
  titleKey: string; // 日付/週/月キー（UI 側で整形）。routine は名前
  fieldLabel: string; // どの欄か
  snippet: string;
  openDate?: string; // daily のみ: タップでその日へ遷移
}

/** マッチ箇所の前後を含む短いスニペットを作る。 */
export function makeSnippet(text: string, query: string, max = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text.length > max ? `${text.slice(0, max)}…` : text;
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + query.length + 40);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${
    end < text.length ? '…' : ''
  }`;
}

/** キーワードで横断検索。空クエリは空配列。大文字小文字は無視。 */
export function search(query: string, data: SearchData): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const has = (t: string) => t.toLowerCase().includes(q);
  const hits: SearchHit[] = [];

  const daily = [...data.daily].sort((a, b) => b.date.localeCompare(a.date));
  for (const e of daily) {
    if (has(e.good))
      hits.push({
        id: `d-${e.id}-good`,
        kind: 'daily',
        titleKey: e.date,
        fieldLabel: 'よかったこと',
        snippet: makeSnippet(e.good, q),
        openDate: e.date,
      });
    if (has(e.redo))
      hits.push({
        id: `d-${e.id}-redo`,
        kind: 'daily',
        titleKey: e.date,
        fieldLabel: 'やり直せるなら',
        snippet: makeSnippet(e.redo, q),
        openDate: e.date,
      });
    e.tasks.forEach((t, i) => {
      if (has(t))
        hits.push({
          id: `d-${e.id}-task${i}`,
          kind: 'daily',
          titleKey: e.date,
          fieldLabel: 'タスク',
          snippet: makeSnippet(t, q),
          openDate: e.date,
        });
    });
  }

  const monthly = [...data.monthly].sort((a, b) =>
    b.monthKey.localeCompare(a.monthKey),
  );
  for (const m of monthly) {
    if (has(m.insights))
      hits.push({
        id: `m-${m.id}-insights`,
        kind: 'monthly',
        titleKey: m.monthKey,
        fieldLabel: '今月の気付き',
        snippet: makeSnippet(m.insights, q),
      });
    if (has(m.memo))
      hits.push({
        id: `m-${m.id}-memo`,
        kind: 'monthly',
        titleKey: m.monthKey,
        fieldLabel: 'MEMO',
        snippet: makeSnippet(m.memo, q),
      });
    m.monthTasks.forEach((t, i) => {
      if (has(t))
        hits.push({
          id: `m-${m.id}-task${i}`,
          kind: 'monthly',
          titleKey: m.monthKey,
          fieldLabel: '今月やること',
          snippet: makeSnippet(t, q),
        });
    });
  }

  const weekly = [...data.weekly].sort((a, b) =>
    b.weekKey.localeCompare(a.weekKey),
  );
  for (const w of weekly) {
    w.weekTasks.forEach((t, i) => {
      if (has(t))
        hits.push({
          id: `w-${w.id}-task${i}`,
          kind: 'weekly',
          titleKey: w.weekKey,
          fieldLabel: '今週のタスク',
          snippet: makeSnippet(t, q),
        });
    });
    w.targetEmotions.forEach((t, i) => {
      if (has(t))
        hits.push({
          id: `w-${w.id}-emotion${i}`,
          kind: 'weekly',
          titleKey: w.weekKey,
          fieldLabel: '感じたい感情',
          snippet: makeSnippet(t, q),
        });
    });
  }

  for (const r of data.routines) {
    if (has(r.name))
      hits.push({
        id: `r-${r.id}`,
        kind: 'routine',
        titleKey: r.name,
        fieldLabel: 'ルーティン',
        snippet: r.name,
      });
  }

  return hits;
}
