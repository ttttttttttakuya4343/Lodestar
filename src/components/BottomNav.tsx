// ボトムナビ。モバイル縦画面ファースト・片手操作（タップ領域大きめ・safe-area 対応）。
import type { TabKey } from '../App';

interface NavItem {
  key: TabKey;
  label: string;
  icon: string; // Phase 0 は絵文字で仮置き（後フェーズでアイコン差し替え）
}

const ITEMS: NavItem[] = [
  { key: 'today', label: '今日', icon: '📝' },
  { key: 'week', label: '週', icon: '🗓️' },
  { key: 'month', label: '月', icon: '📅' },
  { key: 'goals', label: '目標', icon: '⭐' },
  { key: 'settings', label: '設定', icon: '⚙️' },
];

interface BottomNavProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="メインナビゲーション"
    >
      <ul className="mx-auto flex max-w-app items-stretch justify-around">
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(item.key)}
                aria-current={isActive ? 'page' : undefined}
                // 高さ最低 56px でタップ領域を確保（片手操作）
                className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
                  isActive ? 'text-accent' : 'text-text-weak'
                }`}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {item.icon}
                </span>
                <span className={isActive ? 'font-semibold' : ''}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
