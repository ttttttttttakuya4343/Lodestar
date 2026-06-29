import { ScreenScaffold } from '../../components/ScreenScaffold';

export function TodayScreen() {
  return (
    <ScreenScaffold eyebrow="TODAY" title="今日の記入">
      <div className="rounded-card border border-line bg-surface p-gutter text-text-weak">
        日次ジャーナル（タスク／ルーティンチェック／よかったこと／やり直せるなら）は
        Phase 1 で実装します。
      </div>
    </ScreenScaffold>
  );
}
