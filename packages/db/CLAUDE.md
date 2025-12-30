# DB パッケージ

Drizzle ORM + Neon PostgreSQL のデータベース層。スキーマ定義、認証設定を管理。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| ORM | Drizzle ORM |
| データベース | Neon PostgreSQL |
| ドライバ | @neondatabase/serverless (HTTP) |
| 認証 | Better Auth |

## フォルダ構成

```
packages/db/
├── src/
│   ├── index.ts              # DB 接続、エクスポート
│   ├── lib/
│   │   └── auth.ts           # Better Auth 設定
│   └── schema/
│       ├── index.ts          # スキーマエクスポート
│       └── auth.ts           # 認証テーブル (user, session, account, verification)
├── drizzle/                  # マイグレーションファイル
│   ├── 0001_*.sql
│   └── meta/
├── drizzle.config.ts
└── package.json
```

## エクスポート

2つのエントリポイント：

```typescript
// メイン（DB 接続 + スキーマ + 演算子）
import { createDb, user, session, eq, and } from "@repo/db";

// Better Auth
import { auth, getAuth } from "@repo/db/auth";
```

## テーブル

### 認証テーブル（Better Auth）

| テーブル | 説明 |
|---------|------|
| `user` | ユーザーアカウント |
| `session` | セッション管理 |
| `account` | OAuth / パスワード情報 |
| `verification` | メール認証トークン |

```typescript
// schema/auth.ts
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

## DB 操作

```typescript
import { createDb, user, eq } from "@repo/db";

const db = createDb(process.env.DATABASE_URL);

// Select
const users = await db.select().from(user);
const one = await db.select().from(user).where(eq(user.id, id));

// Insert
await db.insert(user).values({ ... });

// Update
await db.update(user).set({ name: "New" }).where(eq(user.id, id));

// Delete
await db.delete(user).where(eq(user.id, id));
```

## Better Auth 設定

```typescript
// lib/auth.ts - 遅延初期化パターン
export function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(createAuthDb(), { provider: "pg" }),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL,
      emailAndPassword: { enabled: true },
    });
  }
  return _auth;
}
```

## コマンド

```bash
# マイグレーション生成
pnpm db:generate

# DB に直接プッシュ（開発用）
pnpm db:push

# マイグレーション実行（本番用）
pnpm db:migrate

# Drizzle Studio（GUI）
pnpm db:studio
```

## テーブル追加手順

1. `schema/` に新しいファイルを作成
   ```typescript
   // schema/posts.ts
   export const posts = pgTable("posts", { ... });
   ```

2. `schema/index.ts` でエクスポート
   ```typescript
   export * from "./posts";
   ```

3. マイグレーション生成
   ```bash
   pnpm db:generate
   ```

4. DB に適用
   ```bash
   pnpm db:push    # 開発
   pnpm db:migrate # 本番
   ```

## 注意点

- **Neon HTTP ドライバ**: コネクションプール不要（サーバーレス最適化）
- **Better Auth 遅延初期化**: ビルド時に環境変数がなくてもエラーにならない
- **マイグレーション**: `drizzle/` ディレクトリはコミット必須
