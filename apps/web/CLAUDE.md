# Web パッケージ

Next.js App Router ベースのフロントエンド。Hono API をプロキシして統合デプロイ。

## 技術スタック

| カテゴリ       | 技術                                    |
| -------------- | --------------------------------------- |
| フレームワーク | Next.js 16 (App Router)                 |
| 言語           | TypeScript, React 19                    |
| スタイリング   | PandaCSS                                |
| フォーム       | react-hook-form + zod                   |
| 認証           | Better Auth (クライアント)              |
| デプロイ       | OpenNext → AWS Lambda                   |
| API            | @repo/api をプロキシ                    |

## フォルダ構成

```
apps/web/
├── panda.config.ts           # PandaCSS 設定
├── postcss.config.cjs        # PostCSS 設定
├── styled-system/            # PandaCSS 生成ファイル（.gitignore）
│
└── src/
    ├── app/                      # App Router
    │   ├── globals.css           # グローバルスタイル
    │   ├── layout.tsx            # ルートレイアウト
    │   ├── page.tsx              # トップページ (/)
    │   │
    │   ├── (auth)/               # 認証グループ（レイアウト共有）
    │   │   ├── sign-in/page.tsx  # サインイン (/sign-in)
    │   │   └── sign-up/page.tsx  # サインアップ (/sign-up)
    │   │
    │   └── api/                  # API Routes
    │       ├── auth/[...all]/    # Better Auth ハンドラー
    │       │   └── route.ts      # POST/GET /api/auth/*
    │       └── v1/[[...path]]/   # Hono API プロキシ
    │           └── route.ts      # ALL /api/v1/* → Hono
    │
    ├── components/               # React コンポーネント
    │   └── auth-status.tsx       # 認証状態表示
    │
    └── lib/                      # ユーティリティ
        └── auth-client.ts        # Better Auth (クライアント用)
```

## スタイリング (PandaCSS)

### デザインコンセプト

**Terminal Neon Aesthetic** - ダークテーマにネオングリーン/シアンのアクセント。

### カスタムトークン

```typescript
// panda.config.ts で定義
colors: {
  void: "#0a0a0f",      // 背景
  abyss: "#12121a",     // カード背景
  neonCyan: "#00ffff",  // プライマリアクセント
  neonGreen: "#39ff14", // セカンダリアクセント
  neonPurple: "#bf00ff",
  neonPink: "#ff007f",
}

fonts: {
  mono: "'JetBrains Mono', monospace",
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
}
```

### 使用方法

```typescript
import { css } from "../../styled-system/css";

// インラインスタイル
<div className={css({
  background: "void",
  color: "neonCyan",
  fontFamily: "mono",
  _hover: {
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
  },
})}>
  Content
</div>
```

### グローバルクラス（globals.css）

| クラス | 説明 |
|--------|------|
| `.grid-bg` | グリッドパターン背景 |
| `.gradient-text` | シアン→グリーン→パープルのグラデーションテキスト |
| `.neon-glow` | ネオングロー効果 |
| `.glass-card` | グラスモーフィズムカード |

```typescript
// 使用例
<div className="glass-card">
  <h1 className="gradient-text">Title</h1>
</div>
```

## ルーティング

| パス          | ファイル                          | 説明              |
| ------------- | --------------------------------- | ----------------- |
| `/`           | `app/page.tsx`                    | トップページ      |
| `/sign-in`    | `app/(auth)/sign-in/page.tsx`     | サインイン        |
| `/sign-up`    | `app/(auth)/sign-up/page.tsx`     | サインアップ      |
| `/api/auth/*` | `app/api/auth/[...all]/route.ts`  | Better Auth       |
| `/api/v1/*`   | `app/api/v1/[[...path]]/route.ts` | Hono API プロキシ |

## API プロキシ

Hono API は Next.js API Routes 経由でプロキシされる：

```
/api/v1/users  →  Hono /api/users
/api/v1/health →  Hono /api/health
/api/v1/me     →  Hono /api/me
```

```typescript
// app/api/v1/[[...path]]/route.ts
export const dynamic = "force-dynamic";

async function getApp() {
  const { default: app } = await import("@repo/api");
  return app;
}

export const GET = async (request: Request) => {
  const app = await getApp();
  return app.fetch(rewriteRequest(request));
};
```

## フォームバリデーション

### スタック

| ライブラリ | 用途 |
|-----------|------|
| `react-hook-form` | フォーム状態管理 |
| `zod` | スキーマバリデーション |
| `@hookform/resolvers` | Zod 連携 |

### スキーマ定義

Auth スキーマは `@repo/core` で一元管理されています。

```typescript
// @repo/core から直接インポート
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignInFormData,
  type SignUpFormData,
} from "@repo/core";
```

### 使用例

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "@repo/core";

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    const result = await signIn.email(data);
    if (result.error) {
      setError("root", { message: result.error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      {errors.root && <span>{errors.root.message}</span>}

      <button disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

### Zod v4 注意点

react-hook-form との型推論のため、`z.string().email()` を使用:

```typescript
// 推奨（react-hook-form との型推論が正しく動作）
z.string().email("Invalid email")

// z.email() は型が unknown になるため避ける
// z.email({ error: "Invalid email" })
```

## 認証

### クライアント側

```typescript
// components/example.tsx
"use client";
import { useSession, signIn, signOut } from "@/lib/auth-client";

export function Example() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <button onClick={() => signIn.email(...)}>Sign In</button>;

  return (
    <div>
      Welcome, {session.user.name}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### サーバー側

```typescript
// app/protected/page.tsx
import { getAuth } from "@repo/db/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

## 開発コマンド

```bash
# ローカル開発
pnpm dev              # localhost:3000

# ビルド
pnpm build            # Next.js ビルド
pnpm build:open-next  # OpenNext ビルド（Lambda 用）

# 型チェック
pnpm typecheck

# クリーン
pnpm clean            # .next, .open-next 削除

# PandaCSS 再生成（通常は自動）
pnpm panda codegen
```

## デプロイ

OpenNext で Next.js を AWS Lambda 用にビルド：

```bash
pnpm build:open-next
# → .open-next/ ディレクトリに出力
```

CDK (`infra/`) が `.open-next/` を Lambda にデプロイ。

## 環境変数

```bash
# .env
DATABASE_URL=postgresql://...          # DB 接続（API プロキシ用）
BETTER_AUTH_SECRET=xxx                 # 認証シークレット
BETTER_AUTH_URL=http://localhost:3000  # 認証ベース URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 公開 URL
```

## ページ追加手順

1. `app/` 配下にディレクトリ作成
2. `page.tsx` を作成
3. `css` 関数でスタイリング
4. 認証が必要なら `getAuth().api.getSession()` でチェック

## コンポーネント追加手順

1. `components/` に `.tsx` ファイル作成
2. クライアントコンポーネントなら先頭に `"use client";`
3. `import { css } from "../../styled-system/css";` でスタイリング
4. 認証状態が必要なら `useSession()` フックを使用

## 注意点

- API Routes (`/api/*`) は `force-dynamic` を設定してビルド時評価を回避
- Better Auth は lazy initialization でビルドエラーを防止
- 認証 Cookie は同一オリジンなので自動で共有される
- `styled-system/` は `.gitignore` に含まれる（自動生成）
- フォントは Google Fonts から CDN 読み込み（JetBrains Mono, Space Grotesk, Inter）
