# クラウド同期（案B）手順

複数端末でデータを同期するための**任意**のバックエンド。静的サイト（案A）はそのままで、
この同期 API（Cognito + HTTP API + Lambda + DynamoDB）を**追加**します。
アプリはローカルファーストのまま（IndexedDB が真実）で、ログイン中に push/pull で同期します。

> 構成は `infra/sync.cloudformation.yaml`。実行には AWS 資格情報が必要で、本ファイルの
> コマンドは自分の手元（または `! aws ...`）で実行してください。

## 1. スタックを作成

```bash
npm run infra:provision-sync
```

完了すると出力（Outputs）に次が表示されます。フロントの `.env` に設定します:

| 出力 | フロント環境変数 |
|---|---|
| ApiEndpoint | `VITE_API_BASE_URL` |
| UserPoolId | `VITE_COGNITO_USER_POOL_ID` |
| UserPoolClientId | `VITE_COGNITO_CLIENT_ID` |
| Region | `VITE_AWS_REGION` |

> 既定のスタック名は `lodestar-sync`、リージョンは `scripts/.env.deploy` の `AWS_REGION`
> （未設定なら `ap-northeast-1`）。別名にする場合は `SYNC_STACK_NAME` を設定。

## 2. ユーザーを作成（自分1人）

セルフサインアップは無効化しているため、管理者として作成します。

```bash
REGION=ap-northeast-1
POOL=<UserPoolId>
EMAIL=you@example.com

# ユーザー作成（仮パスワードはメール通知 or 下記で恒久PWを直接設定）
aws cognito-idp admin-create-user --region "$REGION" \
  --user-pool-id "$POOL" --username "$EMAIL" \
  --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true \
  --message-action SUPPRESS

# 恒久パスワードを設定（12文字以上・英大小+数字）
aws cognito-idp admin-set-user-password --region "$REGION" \
  --user-pool-id "$POOL" --username "$EMAIL" \
  --password '<StrongPassw0rd>' --permanent
```

## 3. フロントに環境変数を設定して再ビルド

`.env`（gitignore 済み）に上記4つを設定し、`npm run deploy`（案A の配信）で反映します。
`VITE_API_BASE_URL` が空なら同期は無効（案A のまま）、値が入ると設定タブに同期 UI が出ます。

```
VITE_API_BASE_URL=https://xxxx.execute-api.ap-northeast-1.amazonaws.com
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_REGION=ap-northeast-1
```

## API 仕様

- `GET /changes?since=<ISO8601>` … `updatedAt` がそれより新しいレコードを返す（`deleted=true` も含む＝削除伝播）
- `POST /changes` … `{ records: [{ entityType, ...record }] }` を受け取り、サーバ側 `updatedAt` と比較して
  **last-write-wins** で upsert。レスポンスは `{ applied, serverTime }`
- いずれも Cognito の JWT（`Authorization: Bearer <idToken>`）が必要

データは `DynamoDB` 単一テーブル（`pk=USER#<sub>`, `sk=<entityType>#<id>`、`byUpdatedAt` GSI）に保存されます。

## コスト

Lambda / DynamoDB(オンデマンド) / HTTP API はいずれも常時無料枠内に収まり、単一ユーザーなら実質 $0〜1/月。
AWS Budgets のアラートは案A と共通で設定しておく。

## 後片付け

```bash
aws cloudformation delete-stack --stack-name lodestar-sync --region ap-northeast-1
```
（DynamoDB テーブルは `Retain` のため、不要なら手動削除）
