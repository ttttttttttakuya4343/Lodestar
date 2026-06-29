import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { dateKey } from './domain/ids';
import { TodayScreen } from './features/today/TodayScreen';
import { WeekScreen } from './features/week/WeekScreen';
import { MonthScreen } from './features/month/MonthScreen';
import { GoalsScreen } from './features/goals/GoalsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

// ボトムナビのタブ識別子。Phase 0 は依存を増やさず useState で切替える。
// Phase 3: 週/月ビューから「指定日で Today を開く」ため、タブと表示日を App に持ち上げた。
export type TabKey = 'today' | 'week' | 'month' | 'goals' | 'settings';

export default function App() {
  const [tab, setTab] = useState<TabKey>('today');
  const [todayDate, setTodayDate] = useState(() => dateKey());

  // 週/月ビューの日付タップ → その日の日次ジャーナルを開く（REQUIREMENTS 4.2）。
  const openDay = (date: string) => {
    setTodayDate(date);
    setTab('today');
  };

  return (
    <div className="min-h-full bg-bg text-text">
      <main>
        {tab === 'today' && (
          <TodayScreen date={todayDate} onChangeDate={setTodayDate} />
        )}
        {tab === 'week' && <WeekScreen onOpenDay={openDay} />}
        {tab === 'month' && <MonthScreen onOpenDay={openDay} />}
        {tab === 'goals' && <GoalsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
