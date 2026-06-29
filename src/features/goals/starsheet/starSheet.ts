import type { StarSheet } from '../../../domain/types';
import { nowIso } from '../../../domain/ids';

// 設計判断: StarSheet は「テーマ別に複数枚」保存する一覧エンティティ（REQUIREMENTS 4.1B）。
// 日次/週/月のような自然キー単一レコードと違い id=UUID で複数持つ。
export function emptyStarSheet(id: string): StarSheet {
  const ts = nowIso();
  return {
    id,
    createdAt: ts,
    updatedAt: ts,
    deleted: false,
    title: '',
    step1: { home: '', work: '' },
    step2: {
      socialTangible: [],
      socialIntangible: [],
      selfTangible: [],
      selfIntangible: [],
    },
    step3: { positiveSentence: '' },
    step4: { routines: [], milestones: [] },
    step5: { strokes: [] },
  };
}
