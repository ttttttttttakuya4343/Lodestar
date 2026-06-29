import { lazy, Suspense, useState } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { Section } from '../../components/Section';
import { dataStore } from '../../data';
import {
  backupFileName,
  isBackupData,
  type ImportMode,
} from '../../data/backup';
import { parseDateKey } from '../../domain/ids';
import { formatBytes, isBackupStale } from '../../lib/storage';
import { isSyncConfigured } from '../../sync/config';
import { EmotionWordsSection } from '../emotions/EmotionWordsSection';
import { useAppSettings } from './useAppSettings';
import { useStorageStatus } from './useStorageStatus';

// 同期 UI（Amplify を含む）は設定済みのときだけ遅延読み込みし、案A のバンドルを軽く保つ。
const SyncSection = lazy(() =>
  import('./SyncSection').then((m) => ({ default: m.SyncSection })),
);

type Status = { kind: 'success' | 'error'; message: string } | null;

function formatBackupDate(iso: string): string {
  const d = parseDateKey(iso.slice(0, 10));
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

interface SettingsScreenProps {
  onOpenGuide: () => void;
}

export function SettingsScreen({ onOpenGuide }: SettingsScreenProps) {
  const [mode, setMode] = useState<ImportMode>('replace');
  const [status, setStatus] = useState<Status>(null);
  const { settings, markBackedUp } = useAppSettings();
  const { persisted, estimate } = useStorageStatus();

  const lastBackupAt = settings?.lastBackupAt ?? null;
  const stale = isBackupStale(lastBackupAt);

  const handleExport = async () => {
    try {
      const data = await dataStore.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFileName();
      a.click();
      URL.revokeObjectURL(url);
      await markBackedUp();
      setStatus({ kind: 'success', message: 'バックアップを書き出しました。' });
    } catch {
      setStatus({ kind: 'error', message: 'エクスポートに失敗しました。' });
    }
  };

  const handleFile = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackupData(parsed)) {
        setStatus({
          kind: 'error',
          message: '有効な Lodestar バックアップファイルではありません。',
        });
        return;
      }
      if (
        mode === 'replace' &&
        !window.confirm(
          '現在の端末内データをすべて置き換えます。よろしいですか？',
        )
      ) {
        return;
      }
      await dataStore.importAll(parsed, mode);
      setStatus({
        kind: 'success',
        message: 'インポートしました。再読み込みします…',
      });
      window.setTimeout(() => window.location.reload(), 900);
    } catch {
      setStatus({ kind: 'error', message: 'ファイルを読み込めませんでした。' });
    }
  };

  const modeButtonClass = (m: ImportMode) =>
    `flex-1 rounded-card border px-3 py-2 text-sm font-semibold active:opacity-90 ${
      mode === m
        ? 'border-accent bg-accent-weak text-text'
        : 'border-line bg-surface text-text-weak'
    }`;

  return (
    <ScreenScaffold eyebrow="SETTINGS" title="設定">
      <Section title="使い方">
        <button
          type="button"
          onClick={onOpenGuide}
          className="flex h-11 w-full items-center justify-between rounded-card border border-line bg-surface px-3 text-sm font-semibold text-text active:bg-accent-weak"
        >
          使い方ガイドを開く
          <span className="text-text-weak" aria-hidden>
            ›
          </span>
        </button>
      </Section>

      <Section title="データのバックアップ">
        <p className="mb-3 text-sm text-text-weak">
          データは端末内にのみ保存されます。機種変更やデータ消失に備えて JSON
          で書き出し・読み込みできます。
        </p>

        <button
          type="button"
          onClick={() => void handleExport()}
          className="h-11 w-full rounded-card bg-accent text-sm font-semibold text-white active:opacity-90"
        >
          エクスポート（バックアップを保存）
        </button>
        <p className="mb-5 mt-2 text-xs text-text-weak">
          前回のバックアップ:{' '}
          {lastBackupAt ? formatBackupDate(lastBackupAt) : '未実施'}
          {stale && (
            <span className="text-accent-strong">
              {' '}
              ・そろそろバックアップをおすすめします
            </span>
          )}
        </p>

        <p className="mb-2 text-sm font-semibold text-text">インポート</p>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('replace')}
            className={modeButtonClass('replace')}
          >
            置き換え
          </button>
          <button
            type="button"
            onClick={() => setMode('merge')}
            className={modeButtonClass('merge')}
          >
            統合
          </button>
        </div>
        <p className="mb-3 text-xs text-text-weak">
          {mode === 'replace'
            ? '現在のデータを消して、ファイルの内容で置き換えます（復元向け）。'
            : 'id ごとに更新日が新しい方を残して取り込みます（端末の統合向け）。'}
        </p>

        <label className="block h-11 w-full cursor-pointer rounded-card border border-accent bg-bg text-center text-sm font-semibold leading-[2.75rem] text-accent active:bg-accent-weak">
          ファイルを選んで読み込む
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = '';
            }}
          />
        </label>

        {status && (
          <p
            className={`mt-3 rounded-card p-3 text-sm ${
              status.kind === 'success'
                ? 'bg-accent-weak text-text'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {status.message}
          </p>
        )}
      </Section>

      <Section title="データの安全性">
        <ul className="space-y-2 rounded-card border border-line bg-surface p-3 text-sm">
          <li className="flex items-center justify-between gap-2">
            <span className="text-text-weak">ストレージの永続化</span>
            <span className="font-semibold text-text">
              {persisted === null
                ? '—'
                : persisted
                  ? '有効'
                  : '未許可'}
            </span>
          </li>
          {estimate && (
            <li className="flex items-center justify-between gap-2">
              <span className="text-text-weak">使用量</span>
              <span className="font-semibold text-text">
                {formatBytes(estimate.usage)}
              </span>
            </li>
          )}
        </ul>
        <p className="mt-2 text-xs text-text-weak">
          永続化が「有効」だと、ブラウザの空き容量不足でもデータが自動削除されにくくなります。
          {persisted === false &&
            ' 端末やブラウザによっては許可されない場合があります。定期的なバックアップが確実です。'}
        </p>
      </Section>

      {isSyncConfigured() && (
        <Suspense fallback={null}>
          <SyncSection />
        </Suspense>
      )}

      <EmotionWordsSection />
    </ScreenScaffold>
  );
}
