#!/usr/bin/env bash
# ビルド → S3 同期 → CloudFront キャッシュ無効化。
# バケット名/ディストリビューションID は CloudFormation スタックの出力から取得する。
# 実行には AWS 資格情報が必要。
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f scripts/.env.deploy ]; then
  set -a
  # shellcheck disable=SC1091
  . scripts/.env.deploy
  set +a
fi

STACK_NAME="${STACK_NAME:-lodestar}"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"

output() {
  aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}

BUCKET="$(output BucketName)"
DIST_ID="$(output DistributionId)"
SITE_URL="$(output SiteUrl)"

if [ -z "${BUCKET}" ] || [ "${BUCKET}" = "None" ]; then
  echo "Could not read stack outputs. Run 'npm run infra:provision' first." >&2
  exit 1
fi

echo "Building..."
npm run build

echo "Syncing dist/ -> s3://${BUCKET}/ ..."
# 1) 不変なハッシュ付きアセットは長期キャッシュ。
aws s3 sync dist/ "s3://${BUCKET}/" \
  --delete \
  --exclude "index.html" \
  --exclude "*.webmanifest" \
  --exclude "sw.js" \
  --exclude "registerSW.js" \
  --cache-control "public,max-age=31536000,immutable"
# 2) エントリ/SW/manifest は毎回更新されうるのでキャッシュさせない。
aws s3 sync dist/ "s3://${BUCKET}/" \
  --exclude "*" \
  --include "index.html" \
  --include "*.webmanifest" \
  --include "sw.js" \
  --include "registerSW.js" \
  --cache-control "no-cache"

echo "Invalidating CloudFront cache (${DIST_ID})..."
aws cloudfront create-invalidation \
  --distribution-id "${DIST_ID}" \
  --paths '/*' >/dev/null

echo "Done. ${SITE_URL}"
