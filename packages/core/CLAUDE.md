# Core パッケージ

モノレポ全体で共有するユーティリティ・型・定数を管理するパッケージ。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript |
| モジュール | ESM |

## フォルダ構成

```
packages/core/
├── src/
│   └── index.ts      # エクスポート
├── package.json
└── tsconfig.json
```

## 現在のエクスポート

```typescript
// 日付を ISO 文字列に変換
export function formatDate(date: Date): string

// UUID を生成
export function generateId(): string

// アプリ名定数
export const APP_NAME = "ts-serverless-starter"
```

## 使い方

```typescript
import { formatDate, generateId, APP_NAME } from "@repo/core";

const id = generateId();           // "550e8400-e29b-41d4-a716-446655440000"
const now = formatDate(new Date()); // "2025-01-01T00:00:00.000Z"
```

## 追加すべきもの

このパッケージに追加する候補：

| 種類 | 例 |
|------|-----|
| 型定義 | `Result<T, E>`, `Nullable<T>` |
| バリデーション | メール・UUID 形式チェック |
| 文字列操作 | slugify, truncate |
| 日付操作 | 相対時間表示 |
| 定数 | ステータスコード、エラーコード |
| エラー型 | 共通の AppError 基底クラス |

## 追加手順

1. `src/` 配下にファイルを作成（または `index.ts` に直接追加）
2. `index.ts` から export
3. 他パッケージで `import { ... } from "@repo/core"` で使用

## 注意点

- 依存関係は最小限に保つ（現在は TypeScript のみ）
- ランタイム依存を追加する場合は慎重に検討
- API / Web 両方で動作することを確認
