// プラス感情ワード集のロジック（React 非依存・テスト容易）。
import type { DataStore } from '../../data/repository';
import type { EmotionWord } from '../../domain/types';
import { newId, nowIso } from '../../domain/ids';

// 代表的なプラス感情語（REQUIREMENTS 11-3 の確定: 既定語を投入。編集・追加・削除可）。
export const DEFAULT_EMOTION_WORDS = [
  'わくわく',
  '嬉しい',
  '楽しい',
  '感謝',
  'ありがとう',
  '達成感',
  '充実感',
  '自信',
  '安心',
  '落ち着き',
  '誇り',
  '希望',
  '前向き',
  '喜び',
  '感動',
  '幸せ',
  '満足',
  '元気',
] as const;

export function makeEmotionWord(label: string, isCustom: boolean): EmotionWord {
  const ts = nowIso();
  return {
    id: newId(),
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    label,
    isCustom,
  };
}

// ワード集が空のときだけ既定語を投入する（初回のみ）。
// 注: ユーザーが全削除した後にページを再読み込みすると再投入される（個人用途では許容）。
export async function ensureDefaultWords(store: DataStore): Promise<void> {
  const all = await store.emotionWords.getAll();
  if (all.length > 0) return;
  for (const label of DEFAULT_EMOTION_WORDS) {
    await store.emotionWords.put(makeEmotionWord(label, false));
  }
}

// 候補のうち、まだ選択されていないものだけを返す。
export function unusedSuggestions(
  suggestions: string[],
  selected: string[],
): string[] {
  const set = new Set(selected);
  return suggestions.filter((s) => !set.has(s));
}
