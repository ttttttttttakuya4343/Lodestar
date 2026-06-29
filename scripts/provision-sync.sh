#!/usr/bin/env bash
# 案B 同期バックエンド（Cognito + HTTP API + Lambda + DynamoDB）のスタックを作成/更新する。
# 静的サイト（案A）とは別スタック。実行には AWS 資格情報が必要。
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f scripts/.env.deploy ]; then
  set -a
  # shellcheck disable=SC1091
  . scripts/.env.deploy
  set +a
fi

SYNC_STACK_NAME="${SYNC_STACK_NAME:-lodestar-sync}"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"

echo "Deploying sync stack '${SYNC_STACK_NAME}' in ${AWS_REGION}..."
aws cloudformation deploy \
  --stack-name "${SYNC_STACK_NAME}" \
  --template-file infra/sync.cloudformation.yaml \
  --region "${AWS_REGION}" \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset

echo
echo "Outputs (フロントの .env に設定する値):"
aws cloudformation describe-stacks \
  --stack-name "${SYNC_STACK_NAME}" \
  --region "${AWS_REGION}" \
  --query 'Stacks[0].Outputs' \
  --output table
