// クラウド同期の UI（設定タブ）。同期が設定されているときだけ表示される。
// ローカルファースト: 同期はここから手動実行でき、起動時にも自動で1回走る。
import { useEffect, useState } from 'react';
import { Section } from '../../components/Section';
import { createSyncEngine } from '../../sync/syncEngine';
import { remoteClient } from '../../sync/remoteClient';
import { currentEmail, login, logout } from '../../sync/auth';
import { getLastSynced } from '../../sync/watermark';

type Msg = { kind: 'success' | 'error'; text: string } | null;

const EPOCH = '1970-01-01T00:00:00.000Z';

function formatSynced(iso: string): string {
  if (iso === EPOCH) return '未同期';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '未同期';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const engine = createSyncEngine({ remote: remoteClient });

export function SyncSection() {
  const [email, setEmail] = useState<string | null>(null);
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [lastSynced, setLastSynced] = useState(() => getLastSynced());

  useEffect(() => {
    let active = true;
    void currentEmail().then((e) => {
      if (active) setEmail(e);
    });
    return () => {
      active = false;
    };
  }, []);

  const runSync = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const { pushed, pulled } = await engine.sync();
      setLastSynced(getLastSynced());
      setMsg({
        kind: 'success',
        text: `同期しました（送信 ${pushed} 件 / 受信 ${pulled} 件）。`,
      });
    } catch {
      setMsg({ kind: 'error', text: '同期に失敗しました。時間をおいて再試行してください。' });
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await login(inputEmail.trim(), inputPassword);
      setEmail(await currentEmail());
      setInputPassword('');
      await runSync();
    } catch {
      setMsg({ kind: 'error', text: 'ログインに失敗しました。メール/パスワードを確認してください。' });
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      setEmail(null);
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-card border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent';
  const primaryBtn =
    'h-11 w-full rounded-card bg-accent text-sm font-semibold text-white active:opacity-90 disabled:opacity-50';

  return (
    <Section title="クラウド同期">
      {email ? (
        <>
          <p className="mb-1 text-sm text-text">
            ログイン中: <span className="font-semibold">{email}</span>
          </p>
          <p className="mb-3 text-xs text-text-weak">
            前回の同期: {formatSynced(lastSynced)}
          </p>
          <button
            type="button"
            onClick={() => void runSync()}
            disabled={busy}
            className={`mb-2 ${primaryBtn}`}
          >
            {busy ? '同期中…' : '今すぐ同期'}
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={busy}
            className="h-11 w-full rounded-card border border-line bg-surface text-sm font-semibold text-text-weak active:bg-accent-weak disabled:opacity-50"
          >
            ログアウト
          </button>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm text-text-weak">
            ログインすると、この端末のデータをクラウドと同期できます。
          </p>
          <div className="space-y-2">
            <input
              type="email"
              autoComplete="username"
              value={inputEmail}
              placeholder="メールアドレス"
              onChange={(e) => setInputEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              autoComplete="current-password"
              value={inputPassword}
              placeholder="パスワード"
              onChange={(e) => setInputPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={() => void handleLogin()}
            disabled={busy || !inputEmail.trim() || !inputPassword}
            className={`mt-3 ${primaryBtn}`}
          >
            {busy ? '処理中…' : 'ログインして同期'}
          </button>
        </>
      )}

      {msg && (
        <p
          className={`mt-3 rounded-card p-3 text-sm ${
            msg.kind === 'success' ? 'bg-accent-weak text-text' : 'bg-red-50 text-red-600'
          }`}
        >
          {msg.text}
        </p>
      )}
    </Section>
  );
}
