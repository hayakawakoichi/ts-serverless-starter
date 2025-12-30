# ts-serverless-starter

[![CI](https://github.com/hayakawakoichi/ts-serverless-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/hayakawakoichi/ts-serverless-starter/actions/workflows/ci.yml)
[![Deploy](https://github.com/hayakawakoichi/ts-serverless-starter/actions/workflows/deploy.yml/badge.svg)](https://github.com/hayakawakoichi/ts-serverless-starter/actions/workflows/deploy.yml)

TypeScript で構築するサーバーレス Web アプリケーションのスターターテンプレート。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| **Frontend** | Next.js 15 (App Router) + React 19 + PandaCSS |
| **Backend** | Hono (Next.js API Routes 経由) |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Auth** | Better Auth (Email/Password) |
| **Deploy** | AWS Lambda + CloudFront (via OpenNext + CDK) |
| **Monorepo** | pnpm Workspaces + Turborepo |

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Lambda (OpenNext)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                     Next.js                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │  /api/auth/* │  │  /api/v1/*   │  │     /*       │  │ │
│  │  │  Better Auth │  │   Hono API   │  │  React SSR   │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 Neon PostgreSQL (Serverless)                │
└─────────────────────────────────────────────────────────────┘
```

## クイックスタート

### 前提条件

- Node.js 20+
- pnpm 9+
- [Neon](https://neon.tech) アカウント（無料枠あり）

### 1. セットアップ

```bash
# リポジトリをクローン
git clone <repo-url>
cd ts-serverless-starter

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.example .env
```

### 2. 環境変数

`.env` ファイルを編集（各パッケージにも `.env.example` あり）:

```bash
# Neon から取得した接続文字列
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# ランダムな32文字以上の文字列
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"

# 開発環境の URL
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

シークレットの生成:
```bash
openssl rand -base64 32
```

### 3. データベース初期化

```bash
# スキーマを DB に反映
pnpm db:push
```

### 4. 開発サーバー起動

```bash
pnpm dev
```

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/v1/docs

## プロジェクト構成

```
ts-serverless-starter/
├── apps/
│   ├── api/                 # Hono REST API
│   │   ├── src/
│   │   │   ├── routes/      # エンドポイント
│   │   │   ├── services/    # ビジネスロジック
│   │   │   ├── repositories/# データアクセス
│   │   │   ├── validators/  # Zod スキーマ
│   │   │   └── middleware/  # 認証など
│   │   └── package.json
│   │
│   └── web/                 # Next.js Frontend
│       ├── src/
│       │   ├── app/         # App Router
│       │   ├── components/  # React コンポーネント
│       │   └── lib/         # ユーティリティ
│       ├── panda.config.ts  # PandaCSS 設定
│       └── package.json
│
├── packages/
│   ├── db/                  # Drizzle ORM + Better Auth
│   │   ├── src/
│   │   │   ├── schema/      # テーブル定義
│   │   │   └── lib/auth.ts  # Better Auth 設定
│   │   └── drizzle/         # マイグレーション
│   │
│   ├── core/                # 共有ユーティリティ
│   └── tsconfig/            # 共有 TypeScript 設定
│
├── infra/                   # AWS CDK
│   └── lib/
│       └── nextjs-stack.ts  # CloudFront + Lambda
│
├── turbo.json               # Turborepo 設定
├── pnpm-workspace.yaml      # pnpm Workspaces 設定
└── package.json             # ルート scripts
```

## 開発コマンド

```bash
# 開発サーバー（全アプリ並列起動）
pnpm dev

# ビルド
pnpm build

# 型チェック
pnpm typecheck

# クリーン
pnpm clean
```

### データベース

```bash
pnpm db:generate   # マイグレーション生成
pnpm db:push       # スキーマを直接 DB に反映（開発用）
pnpm db:migrate    # マイグレーション実行（本番用）
pnpm db:studio     # Drizzle Studio（GUI）
```

### デプロイ

```bash
cd infra
pnpm cdk bootstrap  # 初回のみ
pnpm cdk deploy     # AWS にデプロイ
```

## API エンドポイント

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| GET | `/api/v1/health` | ヘルスチェック | 不要 |
| GET | `/api/v1/users` | ユーザー一覧 | 不要 |
| GET | `/api/v1/users/:id` | ユーザー詳細 | 不要 |
| POST | `/api/v1/users` | ユーザー作成 | 不要 |
| GET | `/api/v1/me` | 現在のユーザー | 必要 |

API ドキュメント: http://localhost:3000/api/v1/docs

## 認証フロー

```typescript
// Frontend (React)
import { signUp, signIn, signOut, useSession } from "@/lib/auth-client";

// サインアップ
await signUp.email({ email, password, name });

// サインイン
await signIn.email({ email, password });

// セッション取得
const { data: session } = useSession();

// サインアウト
await signOut();
```

```typescript
// Backend (Hono)
import { requireAuth } from "./middleware/auth";

// 認証必須エンドポイント
app.get("/api/me", requireAuth, (c) => {
  const user = c.get("user");
  return c.json({ user });
});
```

## テーブル追加

```typescript
// 1. packages/db/src/schema/posts.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: text("author_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. packages/db/src/schema/index.ts でエクスポート
export * from "./posts";

// 3. マイグレーション生成 & 適用
pnpm db:generate
pnpm db:push
```

## API エンドポイント追加

```typescript
// 1. apps/api/src/validators/post.ts
export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

// 2. apps/api/src/repositories/post.repository.ts
export const postRepository = {
  findAll: () => db.select().from(posts),
  create: (data) => db.insert(posts).values(data).returning(),
};

// 3. apps/api/src/services/post.service.ts
export const postService = {
  getAllPosts: () => postRepository.findAll(),
  createPost: (data) => postRepository.create(data),
};

// 4. apps/api/src/routes/posts.ts
const app = new Hono();
app.get("/", async (c) => {
  const posts = await postService.getAllPosts();
  return c.json({ posts });
});
export default app;

// 5. apps/api/src/index.ts で登録
app.route("/api/posts", postsRoute);
```

## CI/CD

### GitHub Actions

| Workflow | Trigger | 内容 |
|----------|---------|------|
| **CI** | Push/PR to `main` | Lint, Format check, Typecheck |
| **Deploy** | Push to `main` | CI + AWS デプロイ |

### AWS OIDC 設定 (推奨)

GitHub Actions から AWS にデプロイするための OIDC 設定:

```bash
# 1. IAM Identity Provider を作成
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# 2. IAM Role を作成 (信頼ポリシー)
# your-github-org/your-repo を実際のリポジトリに置き換え
```

信頼ポリシー (`trust-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:hayakawakoichi/ts-serverless-starter:*"
        }
      }
    }
  ]
}
```

```bash
# Role 作成
aws iam create-role \
  --role-name GitHubActionsDeployRole \
  --assume-role-policy-document file://trust-policy.json

# 必要な権限をアタッチ (CDK デプロイ用)
aws iam attach-role-policy \
  --role-name GitHubActionsDeployRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### GitHub Secrets 設定

| Secret | 説明 |
|--------|------|
| `AWS_ROLE_ARN` | 上で作成した IAM Role の ARN |

GitHub リポジトリの Settings → Secrets and variables → Actions で設定。

## AWS デプロイ (手動)

### 前提条件

1. AWS CLI が設定済み
2. Secrets Manager にシークレットを作成:

```bash
aws secretsmanager create-secret \
  --name ts-serverless-starter/database-url \
  --secret-string "postgresql://..."

aws secretsmanager create-secret \
  --name ts-serverless-starter/auth-secret \
  --secret-string "your-secret"
```

### デプロイ実行

```bash
cd infra
pnpm cdk bootstrap   # 初回のみ
pnpm cdk deploy
```

デプロイ完了後、CloudFront ドメインが出力されます。

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| `styled-system` が見つからない | `pnpm prepare` を実行 |
| DB 接続エラー | `.env` の `DATABASE_URL` を確認 |
| 認証が動作しない | `BETTER_AUTH_SECRET` が32文字以上か確認 |
| ビルドエラー | `pnpm clean && pnpm install` |

## ドキュメント

詳細なドキュメントは各パッケージの `CLAUDE.md` を参照:

- [apps/web/CLAUDE.md](./apps/web/CLAUDE.md) - Frontend
- [apps/api/CLAUDE.md](./apps/api/CLAUDE.md) - Backend API
- [packages/db/CLAUDE.md](./packages/db/CLAUDE.md) - Database
- [packages/core/CLAUDE.md](./packages/core/CLAUDE.md) - Shared utilities
- [infra/CLAUDE.md](./infra/CLAUDE.md) - AWS Infrastructure

## ライセンス

MIT
