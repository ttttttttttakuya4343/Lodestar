// タグ（チップ）形式の文字列リスト。今週感じたいプラス感情などに使う。
import { useState } from 'react';

interface TagListEditorProps {
  tags: string[];
  placeholder: string;
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
}

export function TagListEditor({
  tags,
  placeholder,
  onAdd,
  onRemove,
}: TagListEditorProps) {
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  return (
    <div>
      {tags.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`「${tag}」を削除`}
                className="flex items-center gap-1 rounded-full bg-accent-weak px-3 py-1.5 text-sm text-text active:opacity-80"
              >
                {tag}
                <span className="text-text-weak" aria-hidden>
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitDraft();
            }
          }}
          className="min-w-0 flex-1 rounded-card border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={commitDraft}
          className="h-10 shrink-0 rounded-card bg-accent px-4 text-sm font-semibold text-white active:opacity-90"
        >
          追加
        </button>
      </div>
    </div>
  );
}
