// プラス感情ワード集の管理（設定タブ内）。一覧・追加・削除。
import { Section } from '../../components/Section';
import { TagListEditor } from '../../components/TagListEditor';
import { useEmotionWords } from './useEmotionWords';

export function EmotionWordsSection() {
  const { words, loading, add, remove } = useEmotionWords();

  return (
    <Section title="プラス感情ワード集">
      <p className="mb-3 text-sm text-text-weak">
        週ビューやスターゾーンの感情入力で、ここの言葉を候補として選べます。
      </p>
      {loading ? (
        <p className="text-text-weak">読み込み中…</p>
      ) : (
        <TagListEditor
          tags={words.map((w) => w.label)}
          placeholder="感情の言葉を追加"
          onAdd={(label) => void add(label)}
          onRemove={(i) => {
            const w = words[i];
            if (w) void remove(w.id);
          }}
        />
      )}
    </Section>
  );
}
