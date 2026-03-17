# Project Instructions

このプロジェクトは React + Vite + TypeScript で構築するSPAです。

## Tech Stack
- React
- Vite
- TypeScript
- TanStack Query
- Tailwind CSS
- shadcn/ui
- lucide-react

## Directory Structure
- `public/`: 静的アセット
- `src/api/`: API関連
  - `trpc/`: APIクライアント基盤
  - `auth/`: 認証関連
  - `session/`: セッション管理
- `src/components/`: UIコンポーネント
  - `ui/`: shadcn/ui ベース
  - `common/`: 汎用コンポーネント
  - `user/`: ドメイン単位コンポーネント
- `src/hooks/`: カスタム hooks
  - `api/`: API呼び出し用 hooks
- `src/pages/`: ページ単位コンポーネント
- `src/routes/`: ルーティング定義
- `src/utils/`: 汎用ユーティリティ
- `src/lib/`: UI補助関数など

## Architecture Rules
- ページ・コンポーネントから API クライアント基盤を直接呼ばない
- API 呼び出しは必ず `src/hooks/api/*` 経由にする
- 認証状態の参照は `src/api/session/*` 経由にする
- BFF 経由の通信を前提とする
- SPA 側では AccessToken / RefreshToken を保持しない
- Cookie ベースのセッションを前提に `credentials: "include"` を利用する

## UI Rules
- UIコンポーネントは shadcn/ui を基本とする
- アイコンは lucide-react を使用する
- Tailwind CSS でスタイリングする
- レイアウトや余白はシンプルで保守しやすくする

## Coding Rules
- TypeScriptは strict を前提とする
- `any` は使用しない
- named export を基本とする
- Fast Refresh を壊さないため、`.tsx` ファイルではコンポーネント以外の export を避ける
- hook / context / util / type は `.ts` に分ける
- import は `@/` エイリアスを優先する
- 1ファイル1責務を意識する

## Naming Rules
- React コンポーネント: `PascalCase`
- hooks: `useXxx`
- utility関数: `camelCase`
- query hooks: `useXxxQuery` ではなく、用途に応じて `useCurrentUser`, `useUpdateProfile` など意味ベースで命名する

## Session / Auth Rules
- `SessionProvider` がログイン状態を管理する
- `useSession()` でセッション情報を参照する
- 認証ガードは `useRequireAuth()` で行う
- ページ側で認証判定ロジックを重複実装しない

## API Rules
- API 通信は hooks に隠蔽する
- hooks 内で TanStack Query を使用する
- queryKey は意味単位で安定した配列にする
- mutation 成功時は必要な query を invalidate する
- エラーハンドリングは hooks または API 層で一貫して扱う

## Output Preference
コード提案時は以下を守ること:
- 必要最小限の差分で提案する
- 変更対象ファイルのパスを明記する
- そのままコピペできる完成コードを出す
- 不足ファイルがある場合は新規作成ファイルも示す
- 推測で存在しない package や monorepo 構成を前提にしない
- 現在の構成に合わせて回答する