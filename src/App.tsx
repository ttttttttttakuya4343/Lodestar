import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { TodayScreen } from './features/today/TodayScreen';
import { WeekScreen } from './features/week/WeekScreen';
import { MonthScreen } from './features/month/MonthScreen';
import { GoalsScreen } from './features/goals/GoalsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

// ボトムナビのタブ識別子。Phase 0 は依存を増やさず useState で切替える。
// （URL ルーティングが必要になれば react-router へ移行可能な構造にしてある）
export type TabKey = 'today' | 'week' | 'month' | 'goals' | 'settings';

const SCREENS: Record<TabKey, () => JSX.Element> = {
  today: TodayScreen,
  week: WeekScreen,
  month: MonthScreen,
  goals: GoalsScreen,
  settings: SettingsScreen,
};

export default function App() {
  const [tab, setTab] = useState<TabKey>('today');
  const Screen = SCREENS[tab];

  return (
    <div className="min-h-full bg-bg text-text">
      <main>
        <Screen />
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
