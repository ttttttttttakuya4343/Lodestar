// Repository インターフェース（抽象）。
// UI 層は保存先（ローカル/リモート）を一切知らず、この契約だけに依存する。
//
// 叩き台 2.3 からの改善: DataStore の各プロパティで `import('...').T` という
// inline import 型を使っていたが、可読性と保守性のため通常の import 文に統一した。
// 型の意味・契約は叩き台と同一。
import type {
  BaseRecord,
  Settings,
  EmotionWord,
  OpenWindow64,
  StarSheet,
  Routine,
  DailyEntry,
  WeeklyEntry,
  MonthlyReflection,
} from '../domain/types';
import type { BackupData, ImportMode } from './backup';

// 1エンティティ分の汎用 CRUD。保存先に依存しない契約。
export interface Repository<T extends BaseRecord> {
  getAll(): Promise<T[]>; // deleted=false のみ返す
  getById(id: string): Promise<T | undefined>;
  put(record: T): Promise<T>; // upsert。updatedAt を更新して返す
  softDelete(id: string): Promise<void>; // deleted=true に
  // 同期用（案B）: updatedAt が iso より後のレコード（deleted も含む）。
  getChangedSince(iso: string): Promise<T[]>;
}

// アプリ全体のデータ窓口。UI はこれだけ見る。
export interface DataStore {
  settings: Repository<Settings>;
  emotionWords: Repository<EmotionWord>;
  openWindow64: Repository<OpenWindow64>;
  starSheets: Repository<StarSheet>;
  routines: Repository<Routine>;
  dailyEntries: Repository<DailyEntry>;
  weeklyEntries: Repository<WeeklyEntry>;
  monthlyReflections: Repository<MonthlyReflection>;

  // JSON バックアップ（全エンティティ一括）。UI は保存先を知らずに呼べる。
  // 案B の RemoteDataStore でも同契約で実装できるようにここに置く。
  exportAll(): Promise<BackupData>;
  importAll(data: BackupData, mode: ImportMode): Promise<void>;
}
