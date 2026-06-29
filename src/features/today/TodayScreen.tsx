import { useState } from 'react';
import type { ReactNode } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { dateKey } from '../../domain/ids';
import { useRoutines } from '../routines/useRoutines';
import { useDailyEntry } from './useDailyEntry';
import {
  addTask,
  isRoutineChecked,
  removeTask,
  toggleRoutineCheck,
  updateTask,
} from './dailyEntry';
import { DateNav } from './DateNav';
import { TaskList } from './TaskList';
import { RoutineCheckList } from './RoutineCheckList';
import { JournalTextField } from './JournalTextField';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-weak">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function TodayScreen() {
  const [date, setDate] = useState(() => dateKey());
  const { entry, loading, apply } = useDailyEntry(date);
  const { routines, addRoutine, removeRoutine } = useRoutines();

  return (
    <ScreenScaffold eyebrow="TODAY" title="日次ジャーナル">
      <DateNav date={date} onChange={setDate} />

      {loading || !entry ? (
        <p className="text-text-weak">読み込み中…</p>
      ) : (
        <>
          <Section title="今日のタスク">
            <TaskList
              tasks={entry.tasks}
              onAdd={(text) => apply((prev) => addTask(prev, text))}
              onUpdate={(i, text) => apply((prev) => updateTask(prev, i, text))}
              onRemove={(i) => apply((prev) => removeTask(prev, i))}
            />
          </Section>

          <Section title="ルーティンチェック">
            <RoutineCheckList
              routines={routines}
              isChecked={(id) => isRoutineChecked(entry, id)}
              onToggle={(id) => apply((prev) => toggleRoutineCheck(prev, id))}
              onAddRoutine={(name) => void addRoutine(name)}
              onRemoveRoutine={(id) => void removeRoutine(id)}
            />
          </Section>

          <Section title="今日のよかったこと">
            <JournalTextField
              label="よかったこと"
              placeholder="小さなことでも書き留めてみましょう"
              value={entry.good}
              onChange={(value) => apply((prev) => ({ ...prev, good: value }))}
            />
          </Section>

          <Section title="今日をもう一度やり直せるなら">
            <JournalTextField
              label="改善行動"
              placeholder="次に活かせる工夫を一つ"
              value={entry.redo}
              onChange={(value) => apply((prev) => ({ ...prev, redo: value }))}
            />
          </Section>
        </>
      )}
    </ScreenScaffold>
  );
}
