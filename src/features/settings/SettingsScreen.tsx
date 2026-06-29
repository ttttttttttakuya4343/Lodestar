import { useState } from 'react';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import { Section } from '../../components/Section';
import { dataStore } from '../../data';
import {
  backupFileName,
  isBackupData,
  type ImportMode,
} from '../../data/backup';

type Status = { kind: 'success' | 'error'; message: string } | null;

export function SettingsScreen() {
  const [mode, setMode] = useState<ImportMode>('replace');
  const [status, setStatus] = useState<Status>(null);

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
      <Section title="データのバックアップ">
        <p className="mb-3 text-sm text-text-weak">
          データは端末内にのみ保存されます。機種変更やデータ消失に備えて JSON
          で書き出し・読み込みできます。
        </p>

        <button
          type="button"
          onClick={() => void handleExport()}
          className="mb-5 h-11 w-full rounded-card bg-accent text-sm font-semibold text-white active:opacity-90"
        >
          エクスポート（バックアップを保存）
        </button>

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
    </ScreenScaffold>
  );
}
