// 今日のタスク（DailyEntry.tasks: string[]）。追加・インライン編集・削除。
import { useState } from 'react';

interface TaskListProps {
  tasks: string[];
  onAdd: (text: string) => void;
  onUpdate: (index: number, text: string) => void;
  onRemove: (index: number) => void;
}

export function TaskList({ tasks, onAdd, onUpdate, onRemove }: TaskListProps) {
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  return (
    <div>
      <ul className="space-y-2">
        {tasks.map((task, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-accent" aria-hidden>
              •
            </span>
            <input
              value={task}
              onChange={(e) => onUpdate(i, e.target.value)}
              className="min-w-0 flex-1 rounded-card border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent"
            />
            <button
              type="button"
              aria-label="タスクを削除"
              onClick={() => onRemove(i)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-weak active:bg-accent-weak"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center gap-2">
        <input
          value={draft}
          placeholder="タスクを追加"
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
