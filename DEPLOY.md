# デプロイ手順（案A: S3 + CloudFront）

Lodestar を AWS の静的ホスティング（S3 非公開バケット + CloudFront）へ配信する手順です。
**独自ドメインは使わず** CloudFront の既定ドメイン（`*.cloudfront.net`）を利用するため、
ACM 証明書も Route 53 も不要で、常時無料枠の範囲で **実質 $0/月** を目標にできます。

構成は `infra/cloudformation.yaml`（S3 + CloudFront + OAC）に定義しています。

## 前提

- **AWS アカウント**（新規なら **Paid Plan＝従量課金** を選ぶ。6か月で閉じる Free Plan は長期運用に不向き）
- **AWS CLI v2** がインストール済みで、資格情報が設定済み（`aws configure` または SSO）
- Node.js（このリポジトリのビルド用）

> この環境では実際の AWS 操作は行いません。下記コマンドは **自分の手元**（資格情報のある端末）で実行してください。
> Claude Code のプロンプトで `! aws ...` のように実行することもできます。

## 1. 設定

```bash
cp scripts/.env.deploy.example scripts/.env.deploy
# STACK_NAME / AWS_REGION を必要に応じて編集（既定: lodestar / ap-northeast-1）
```

`scripts/.env.deploy` は gitignore 済みです。

## 2. インフラを作成（初回 / 構成変更時）

```bash
npm run infra:provision
```

`aws cloudformation deploy` でスタックを作成し、完了後に出力（Outputs）を表示します。
表示される **SiteUrl**（`https://xxxx.cloudfront.net`）が公開 URL です。
初回は CloudFront の配信開始まで数分かかります。

## 3. アプリをデプロイ（更新のたび）

```bash
npm run deploy
```

内部で次を行います:

1. `npm run build`（型チェック + 本番ビルド → `dist/`）
2. `aws s3 sync dist/ s3://<bucket> --delete`
   - ハッシュ付きアセットは長期キャッシュ（`max-age=31536000,immutable`）
   - `index.html` / `*.webmanifest` / `sw.js` / `registerSW.js` は `no-cache`
3. `aws cloudfront create-invalidation --paths "/*"`（キャッシュ無効化）

バケット名・ディストリビューション ID は CloudFormation スタックの出力から自動取得します。

## 4. コスト管理（$5 を超えないために）

- **AWS Budgets** で月 $1〜5 のアラートを設定する。
- **EC2 / NAT Gateway / 公開 IPv4 は使わない**（高額で無料枠外）。静的配信のみで通す。
- CloudFront は無料枠（月 1TB 転送・1000万リクエスト、恒久）、S3 は数 MB＝ほぼ無料。
- AWS の料金・無料枠は変動するため、着手前に公式の料金ページで最新値を確認する。
- `PriceClass`（`infra/cloudformation.yaml` のパラメータ）は既定 `PriceClass_200`（日本のエッジを含む）。
  最安にするなら `PriceClass_100`。

## 5. 後片付け（スタック削除）

S3 バケットは `DeletionPolicy: Retain` のため、先に中身を空にしてからバケットとスタックを削除します。

```bash
# 出力からバケット名を取得して空にする
aws s3 rm "s3://<bucket>" --recursive
aws s3 rb "s3://<bucket>"           # バケット自体を削除（Retain のため手動）
aws cloudformation delete-stack --stack-name lodestar --region ap-northeast-1
```

## 補足

- PWA（Service Worker / manifest）はビルド時に生成され、`dist/` に含まれます。HTTPS 配信（CloudFront）で
  ホーム画面追加・オフライン起動が有効になります。
- データは端末内 IndexedDB に保存され、サーバーには送信されません（案A）。
