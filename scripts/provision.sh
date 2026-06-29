#!/usr/bin/env bash
# CloudFormation スタックを作成/更新する（S3 + CloudFront + OAC）。
# 実行には AWS 資格情報（aws configure / SSO 等）が必要。課金が発生しうる外部操作。
set -euo pipefail

cd "$(dirname "$0")/.."

# scripts/.env.deploy があれば読み込む（STACK_NAME / AWS_REGION / AWS_PROFILE 等）。
if [ -f scripts/.env.deploy ]; then
  set -a
  # shellcheck disable=SC1091
  . scripts/.env.deploy
  set +a
fi

STACK_NAME="${STACK_NAME:-lodestar}"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"

echo "Deploying CloudFormation stack '${STACK_NAME}' in ${AWS_REGION}..."
aws cloudformation deploy \
  --stack-name "${STACK_NAME}" \
  --template-file infra/cloudformation.yaml \
  --region "${AWS_REGION}" \
  --no-fail-on-empty-changeset

echo
echo "Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${AWS_REGION}" \
  --query 'Stacks[0].Outputs' \
  --output table
