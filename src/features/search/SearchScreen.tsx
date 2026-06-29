// 横断検索オーバーレイ。Today から開く。日次の結果はタップでその日へ遷移。
import { useMemo, useState } from 'react';
import { parseDateKey } from '../../domain/ids';
import { search, type SearchHit } from './search';
import { useSearchData } from './useSearchData';

interface SearchScreenProps {
  onOpenDay: (date: string) => void;
  onClose: () => void;
}

function formatTitle(hit: SearchHit): string {
  switch (hit.kind) {
    case 'daily': {
      const d = parseDateKey(hit.titleKey);
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    }
    case 'monthly': {
      const [y, m] = hit.titleKey.split('-');
      return `${y}年${Number(m)}月`;
    }
    case 'weekly':
      return hit.titleKey;
    case 'routine':
      return 'ルーティン';
  }
}

export function SearchScreen({ onOpenDay, onClose }: SearchScreenProps) {
  const { data, loading } = useSearchData();
  const [query, setQuery] = useState('');
  const hits = useMemo(() => search(query, data), [query, data]);
  const trimmed = query.trim();

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-bg">
      <div
        className="mx-auto max-w-app px-gutter pb-24"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + var(--space))' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-text-weak active:bg-accent-weak"
          >
            ‹
          </button>
          <input
            autoFocus
            value={query}
            placeholder="よかったこと・気付きを検索"
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 rounded-card border border-line bg-surface px-3 py-2.5 text-base outline-none focus:border-accent"
          />
        </div>

        {loading ? (
          <p className="text-text-weak">読み込み中…</p>
        ) : trimmed === '' ? (
          <p className="text-sm text-text-weak">
            キーワードを入力すると、過去の記録を横断検索します。
          </p>
        ) : hits.length === 0 ? (
          <p className="text-sm text-text-weak">
            「{trimmed}」に一致する記録はありませんでした。
          </p>
        ) : (
          <>
            <p className="mb-2 text-xs text-text-weak">{hits.length}件</p>
            <ul className="space-y-2">
              {hits.map((hit) => {
                const inner = (
                  <>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-text">
                        {formatTitle(hit)}
                      </span>
                      <span className="rounded-full bg-accent-weak px-2 py-0.5 text-xs text-text">
                        {hit.fieldLabel}
                      </span>
                    </div>
                    <p className="text-sm text-text-weak">{hit.snippet}</p>
                  </>
                );
                return (
                  <li key={hit.id}>
                    {hit.openDate ? (
                      <button
                        type="button"
                        onClick={() => onOpenDay(hit.openDate as string)}
                        className="w-full rounded-card border border-line bg-surface p-3 text-left active:bg-accent-weak"
                      >
                        {inner}
                      </button>
                    ) : (
                      <div className="rounded-card border border-line bg-surface p-3">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
