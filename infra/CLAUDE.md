# Infra パッケージ

AWS CDK による Infrastructure as Code。Next.js + Hono API を Lambda にデプロイ。

## 技術スタック

| カテゴリ         | 技術                             |
| ---------------- | -------------------------------- |
| IaC              | AWS CDK v2                       |
| 言語             | TypeScript                       |
| Next.js デプロイ | cdk-nextjs-standalone + OpenNext |
| シークレット     | AWS Secrets Manager              |
| CDN              | CloudFront                       |
| コンピュート     | Lambda                           |

## フォルダ構成

```
infra/
├── bin/
│   └── app.ts              # CDK エントリポイント
├── lib/
│   ├── nextjs-stack.ts     # Next.js スタック（現在使用）
│   └── api-stack.ts        # API 単体スタック（未使用）
├── cdk.json                # CDK 設定
├── package.json
└── tsconfig.json
```

## スタック

### NextjsStack（現在使用）

`cdk-nextjs-standalone` を使用した Next.js デプロイ：

```
┌─────────────────────────────────────────────────────┐
│  CloudFront Distribution                            │
│  └── d2udzpw05pnoqx.cloudfront.net                 │
└─────────────────────────────────────────────────────┘
         │
         ├── /api/* ──────────→ Server Lambda
         ├── /_next/static/* ──→ S3 Bucket
         └── /* ──────────────→ Server Lambda
                                     │
                                     ├── Secrets Manager (DATABASE_URL)
                                     └── Secrets Manager (BETTER_AUTH_SECRET)
```

**作成されるリソース：**

- CloudFront Distribution
- S3 Bucket（静的アセット）
- Lambda Functions
  - Server Function（SSR）
  - Image Optimization Function
  - Revalidation Function
  - Warmer Function
- DynamoDB Table（ISR キャッシュ）
- SQS Queue（Revalidation）

### ApiStack（未使用・参考用）

Hono API を Lambda 単体でデプロイする構成：

```
API Gateway (HTTP API)
    └── /{proxy+} ──→ Lambda (Hono)
                          │
                          └── Secrets Manager (DATABASE_URL)
```

## コマンド

```bash
# CDK CLI（pnpm スクリプト経由）
pnpm cdk bootstrap    # 初回セットアップ
pnpm cdk synth        # CloudFormation テンプレート生成
pnpm cdk deploy       # デプロイ
pnpm cdk diff         # 差分確認
pnpm cdk destroy      # 削除

# 型チェック
pnpm typecheck
```

## シークレット管理

Secrets Manager に以下のシークレットが必要：

| シークレット名                       | 内容               |
| ------------------------------------ | ------------------ |
| `ts-serverless-starter/database-url` | DATABASE_URL       |
| `ts-serverless-starter/auth-secret`  | BETTER_AUTH_SECRET |

```bash
# シークレット作成
aws secretsmanager create-secret \
  --name ts-serverless-starter/database-url \
  --secret-string "postgresql://..."

aws secretsmanager create-secret \
  --name ts-serverless-starter/auth-secret \
  --secret-string "your-secret"
```

## 環境変数の渡し方

CloudFormation 動的参照を使用：

```typescript
environment: {
  // Secrets Manager から動的に取得
  DATABASE_URL: `{{resolve:secretsmanager:ts-serverless-starter/database-url}}`,
  BETTER_AUTH_SECRET: `{{resolve:secretsmanager:ts-serverless-starter/auth-secret}}`,
  // 直接指定
  BETTER_AUTH_URL: "https://d2udzpw05pnoqx.cloudfront.net",
}
```

## デプロイフロー

```
1. pnpm cdk deploy
      │
      ├── OpenNext ビルド（自動実行）
      │   └── apps/web/.open-next/ 生成
      │
      ├── CloudFormation テンプレート生成
      │
      └── AWS にデプロイ
          ├── S3 に静的アセットアップロード
          ├── Lambda 関数作成/更新
          └── CloudFront 作成/更新
```

## 注意点

- **初回デプロイ後の URL 更新**: CloudFront ドメイン取得後、`BETTER_AUTH_URL` を更新して再デプロイ
- **シークレット ARN**: `fromSecretCompleteArn` を使用（`fromSecretNameV2` は動的参照と併用不可）
- **ビルド時間**: 初回デプロイは 5-10 分程度かかる

## 新しいスタック追加手順

1. `lib/` に新しいスタックファイルを作成
2. `bin/app.ts` でスタックをインスタンス化
3. `pnpm cdk synth` で確認
4. `pnpm cdk deploy` でデプロイ

## トラブルシューティング

| 問題               | 解決策                                         |
| ------------------ | ---------------------------------------------- |
| `Secret not found` | Secrets Manager にシークレットが存在するか確認 |
| ビルドエラー       | `apps/web/.open-next` を削除して再ビルド       |
| スタック削除失敗   | S3 バケットを手動で空にしてから再試行          |
