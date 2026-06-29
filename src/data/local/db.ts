// Dexie 定義（テーブル・インデックス）。叩き台 2.5 を採用。
import Dexie, { type Table } from 'dexie';
import type {
  Settings,
  EmotionWord,
  OpenWindow64,
  StarSheet,
  Routine,
  DailyEntry,
  WeeklyEntry,
  MonthlyReflection,
} from '../../domain/types';

export class AppDB extends Dexie {
  settings!: Table<Settings, string>;
  emotionWords!: Table<EmotionWord, string>;
  openWindow64!: Table<OpenWindow64, string>;
  starSheets!: Table<StarSheet, string>;
  routines!: Table<Routine, string>;
  dailyEntries!: Table<DailyEntry, string>;
  weeklyEntries!: Table<WeeklyEntry, string>;
  monthlyReflections!: Table<MonthlyReflection, string>;

  constructor() {
    super('lodestar');
    // updatedAt / deleted は同期・一覧取得用に索引化。
    // deleted は boolean だが IndexedDB は boolean をインデックスできないため、
    // クエリ時は getAll 側で filter する（インデックスは将来の拡張余地として残す）。
    this.version(1).stores({
      settings: 'id, updatedAt, deleted',
      emotionWords: 'id, updatedAt, deleted',
      openWindow64: 'id, type, updatedAt, deleted',
      starSheets: 'id, updatedAt, deleted',
      routines: 'id, status, updatedAt, deleted',
      dailyEntries: 'id, date, updatedAt, deleted',
      weeklyEntries: 'id, weekKey, updatedAt, deleted',
      monthlyReflections: 'id, monthKey, updatedAt, deleted',
    });
  }
}

export const db = new AppDB();
