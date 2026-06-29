// スターシート（STEP1〜5）エディタ。目標タブから開くフル画面。自動保存。
import { ScreenScaffold } from '../../../components/ScreenScaffold';
import { Section } from '../../../components/Section';
import { StringListEditor } from '../../../components/StringListEditor';
import { PairListEditor } from '../../../components/PairListEditor';
import { JournalTextField } from '../../today/JournalTextField';
import { pushTrimmed, removeAt, setAt } from '../../../lib/arrayOps';
import { dataStore } from '../../../data';
import { useKeyedRecord } from '../../../lib/useKeyedRecord';
import { emptyStarSheet } from './starSheet';

interface StarSheetEditorProps {
  id: string;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-card border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent';

export function StarSheetEditor({ id, onClose }: StarSheetEditorProps) {
  const { record, loading, apply } = useKeyedRecord(
    dataStore.starSheets,
    id,
    emptyStarSheet,
  );

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-bg">
      <ScreenScaffold eyebrow="STAR SHEET" title="スターシート">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex items-center gap-1 text-sm font-semibold text-accent active:opacity-80"
        >
          ‹ 一覧へ戻る
        </button>

        {loading || !record ? (
          <p className="text-text-weak">読み込み中…</p>
        ) : (
          <>
            <Section title="タイトル">
              <input
                value={record.title}
                placeholder="例: 2027年のキャリア目標"
                onChange={(e) =>
                  apply((p) => ({ ...p, title: e.target.value }))
                }
                className={inputClass}
              />
            </Section>

            <Section title="STEP1 毎日する奉仕活動">
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-text-weak">家で</span>
                  <input
                    value={record.step1.home}
                    onChange={(e) =>
                      apply((p) => ({
                        ...p,
                        step1: { ...p.step1, home: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-text-weak">職場で</span>
                  <input
                    value={record.step1.work}
                    onChange={(e) =>
                      apply((p) => ({
                        ...p,
                        step1: { ...p.step1, work: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </label>
              </div>
            </Section>

            <Section title="STEP2 目標を広げる（4観点）">
              <div className="space-y-5">
                <Step2List
                  label="社会・他者 — 有形"
                  items={record.step2.socialTangible}
                  onChange={(fn) =>
                    apply((p) => ({
                      ...p,
                      step2: { ...p.step2, socialTangible: fn(p.step2.socialTangible) },
                    }))
                  }
                />
                <Step2List
                  label="社会・他者 — 無形"
                  items={record.step2.socialIntangible}
                  onChange={(fn) =>
                    apply((p) => ({
                      ...p,
                      step2: { ...p.step2, socialIntangible: fn(p.step2.socialIntangible) },
                    }))
                  }
                />
                <Step2List
                  label="あなた自身 — 有形"
                  items={record.step2.selfTangible}
                  onChange={(fn) =>
                    apply((p) => ({
                      ...p,
                      step2: { ...p.step2, selfTangible: fn(p.step2.selfTangible) },
                    }))
                  }
                />
                <Step2List
                  label="あなた自身 — 無形"
                  items={record.step2.selfIntangible}
                  onChange={(fn) =>
                    apply((p) => ({
                      ...p,
                      step2: { ...p.step2, selfIntangible: fn(p.step2.selfIntangible) },
                    }))
                  }
                />
              </div>
            </Section>

            <Section title="STEP3 ポジティブセンテンス">
              <JournalTextField
                label="「私は ○年○月○日までに ○○をする！」"
                placeholder="プラスの感情の言葉を含めて書きましょう"
                value={record.step3.positiveSentence}
                onChange={(v) =>
                  apply((p) => ({ ...p, step3: { positiveSentence: v } }))
                }
              />
            </Section>

            <Section title="STEP4 毎日のルーティン">
              <StringListEditor
                items={record.step4.routines}
                placeholder="毎日行うルーティンを追加"
                onAdd={(t) =>
                  apply((p) => ({
                    ...p,
                    step4: { ...p.step4, routines: pushTrimmed(p.step4.routines, t) },
                  }))
                }
                onUpdate={(i, t) =>
                  apply((p) => ({
                    ...p,
                    step4: { ...p.step4, routines: setAt(p.step4.routines, i, t) },
                  }))
                }
                onRemove={(i) =>
                  apply((p) => ({
                    ...p,
                    step4: { ...p.step4, routines: removeAt(p.step4.routines, i) },
                  }))
                }
              />
            </Section>

            <Section title="STEP4 行動・期日（マイルストーン）">
              <PairListEditor
                items={record.step4.milestones.map((m) => ({
                  first: m.text,
                  second: m.dueDate,
                }))}
                firstPlaceholder="行動・マイルストーン"
                secondPlaceholder="期日"
                secondType="date"
                onAdd={(pair) =>
                  apply((p) => ({
                    ...p,
                    step4: {
                      ...p.step4,
                      milestones: [
                        ...p.step4.milestones,
                        { text: pair.first, dueDate: pair.second },
                      ],
                    },
                  }))
                }
                onUpdate={(i, pair) =>
                  apply((p) => ({
                    ...p,
                    step4: {
                      ...p.step4,
                      milestones: p.step4.milestones.map((m, idx) =>
                        idx === i ? { text: pair.first, dueDate: pair.second } : m,
                      ),
                    },
                  }))
                }
                onRemove={(i) =>
                  apply((p) => ({
                    ...p,
                    step4: { ...p.step4, milestones: removeAt(p.step4.milestones, i) },
                  }))
                }
              />
            </Section>

            <Section title="STEP5 必要なストローク">
              <PairListEditor
                items={record.step5.strokes.map((s) => ({
                  first: s.from,
                  second: s.content,
                }))}
                firstPlaceholder="誰から"
                secondPlaceholder="どんなストロークを"
                onAdd={(pair) =>
                  apply((p) => ({
                    ...p,
                    step5: {
                      strokes: [
                        ...p.step5.strokes,
                        { from: pair.first, content: pair.second },
                      ],
                    },
                  }))
                }
                onUpdate={(i, pair) =>
                  apply((p) => ({
                    ...p,
                    step5: {
                      strokes: p.step5.strokes.map((s, idx) =>
                        idx === i ? { from: pair.first, content: pair.second } : s,
                      ),
                    },
                  }))
                }
                onRemove={(i) =>
                  apply((p) => ({
                    ...p,
                    step5: { strokes: removeAt(p.step5.strokes, i) },
                  }))
                }
              />
            </Section>
          </>
        )}
      </ScreenScaffold>
    </div>
  );
}

// STEP2 の各観点リスト。apply への更新関数を (list)=>list の形で受け取り重複を減らす。
function Step2List({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (fn: (list: string[]) => string[]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-text">{label}</p>
      <StringListEditor
        items={items}
        placeholder="目標を追加"
        onAdd={(t) => onChange((list) => pushTrimmed(list, t))}
        onUpdate={(i, t) => onChange((list) => setAt(list, i, t))}
        onRemove={(i) => onChange((list) => removeAt(list, i))}
      />
    </div>
  );
}
