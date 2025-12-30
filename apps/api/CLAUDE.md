# API パッケージ

Hono ベースの REST API。Next.js API Routes 経由でプロキシされる。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Hono |
| バリデーション | Zod + @hono/zod-validator |
| ORM | Drizzle ORM |
| データベース | Neon PostgreSQL |
| 認証 | Better Auth |
| ドキュメント | Scalar (OpenAPI) |
| ビルド | tsup (Lambda 単体デプロイ用) |

## フォルダ構成

```
src/
├── index.ts              # Hono アプリ本体
├── lambda.ts             # Lambda ハンドラー（単体デプロイ用）
├── local.ts              # ローカル開発サーバー
│
├── routes/               # エンドポイント定義
│   ├── health.ts         # GET /api/health
│   ├── users.ts          # CRUD /api/users
│   └── me.ts             # GET /api/me（認証必須）
│
├── validators/           # Zod バリデーションスキーマ
│   ├── index.ts
│   └── user.ts           # ユーザー関連スキーマ
│
├── services/             # ビジネスロジック
│   └── user.service.ts
│
├── repositories/         # データアクセス（DB操作）
│   └── user.repository.ts
│
├── middleware/           # ミドルウェア
│   └── auth.ts           # 認証（authMiddleware, requireAuth）
│
└── lib/                  # ユーティリティ
    ├── db.ts             # DB 接続シングルトン
    ├── errors.ts         # カスタムエラー
    └── openapi.ts        # OpenAPI スキーマ
```

## アーキテクチャ

```
Request
    ↓
┌─────────────────────────────────────┐
│  Middleware (middleware/)           │
│  - CORS, Logger, Auth               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Route (routes/)                    │
│  - リクエスト検証 (Zod)             │
│  - レスポンス整形                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Service (services/)                │
│  - ビジネスロジック                 │
│  - エラーハンドリング               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Repository (repositories/)         │
│  - Drizzle ORM で DB 操作           │
│  - 単純な CRUD のみ                 │
└─────────────────────────────────────┘
    ↓
  Database (Neon)
```

## 開発コマンド

```bash
# ローカル開発（単体）
pnpm dev              # localhost:3001

# ビルド（Lambda 単体デプロイ用）
pnpm build            # tsup → dist/

# 型チェック
pnpm typecheck
```

## エンドポイント追加手順

1. **Validator**: `validators/xxx.ts` に Zod スキーマを定義
2. **Repository**: `repositories/xxx.repository.ts` に DB 操作を追加
3. **Service**: `services/xxx.service.ts` にビジネスロジックを追加
4. **Route**: `routes/xxx.ts` にエンドポイントを定義
5. **登録**: `index.ts` で `app.route()` を追加
6. **OpenAPI**: `lib/openapi.ts` にスキーマを追加（任意）

## 認証

### ルート規約

| パス | 認証 | 説明 |
|------|------|------|
| `/api/me/*` | **必須** | ログインユーザー自身のリソース |
| `/api/*` (その他) | 任意 | 公開エンドポイント |

```typescript
// index.ts での設定
// ===== Public Routes =====
app.route("/api/health", healthRoutes)
app.route("/api/users", userRoutes)

// ===== Protected Routes (/api/me/*) =====
app.use("/api/me/*", requireAuth)  // グループ全体に適用
app.route("/api/me", meRoutes)
```

### Protected ルートの実装

`/api/me/*` 配下のルートでは `requireAuth` は不要（自動適用）：

```typescript
// routes/me.ts
export const meRoutes = new Hono<{ Variables: AuthVariables }>()

meRoutes.get("/", (c) => {
  // user は必ず存在（requireAuth で保証）
  const user = c.get("user")!
  return c.json({ user })
})

meRoutes.get("/posts", (c) => {
  const user = c.get("user")!
  // ログインユーザーの投稿を取得...
})
```

### Public ルートでの認証情報取得

公開ルートでも `authMiddleware` によりセッション情報は取得可能：

```typescript
// routes/users.ts
app.get("/", (c) => {
  const user = c.get("user")  // null の可能性あり
  if (user) {
    // ログイン済みユーザー向けの処理
  }
  return c.json({ users })
})
```

## バリデーション

バリデーションスキーマは `validators/` に定義：

```typescript
// validators/user.ts
import { z } from "zod";

// Zod v4 構文: z.email() を使用
export const createUserSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  name: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

ルートで使用：

```typescript
// routes/users.ts
import { zValidator } from "@hono/zod-validator";
import { createUserSchema } from "../validators";

app.post("/api/users", zValidator("json", createUserSchema), async (c) => {
  const data = c.req.valid("json"); // 型安全
  // ...
});
```

## エラーハンドリング

```typescript
import { NotFoundError, ValidationError } from "./lib/errors";

// Service 層で throw
throw new NotFoundError("User not found");
throw new ValidationError("Invalid email format");

// index.ts のグローバルハンドラーでキャッチ → JSON レスポンス
// { "error": "User not found", "code": "NOT_FOUND" }
```

## デプロイ形態

| 形態 | 説明 |
|------|------|
| **Next.js 経由（現在）** | `/api/v1/*` → Hono にプロキシ |
| Lambda 単体 | `lambda.ts` を直接デプロイ |
