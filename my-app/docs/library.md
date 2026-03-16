## API通信・型安全まわり

`@tanstack/react-query`
- サーバーから取ってくるデータを React で扱いやすくするライブラリです。
- useQuery で取得、useMutation で更新、キャッシュ、再取得、無効化などをまとめて管理できます。
- TanStack Query は「server state」を扱うための仕組みとして案内されています。

`@trpc/client`
- tRPC のクライアント側ライブラリです。
- フロントエンドから tRPC サーバーの procedure を呼ぶための土台です。
- tRPC はフロント側から API を「ローカル関数のように」型安全に呼べる体験を提供します。

`@trpc/tanstack-react-query`
- tRPC を TanStack Query と自然に組み合わせるためのライブラリです。
- 公式でも、React + TanStack Query で tRPC を使うならこの統合が推奨されています。
- queryOptions や mutationOptions など、TanStack Query ネイティブな形で使いやすくなります。

`@trpc/server`
- tRPC のサーバー側ライブラリです。
- ルーターや procedure を定義して、型安全な API を作る側です。つまり client が呼ぶ相手を作るための本体です。

`superjson`
- 普通の JSON だと扱いにくい Date や BigInt などを、安全にシリアライズ／デシリアライズしやすくするライブラリです。
- tRPC と一緒に使われることが多いです。
- なお、2025年10月の v2.0.0 では ESM 専用・Node.js 16+ という変更があります。

`zod`
- TypeScript 向けのバリデーションライブラリです。
- スキーマを書いて、フォーム入力や API 入出力が正しい形か検証できます。定義したスキーマから型推論もできます。
- 現在は Zod 4 が stable と案内されています。

## 画面遷移・UIまわり

`react-router-dom`
- React アプリの画面遷移を担当するルーターです。
- URL に応じてページを切り替えます。
- 公式では React Router は React 用の multi-strategy router と説明されていて、Web プロジェクトでは createBrowserRouter が推奨されています。
- なお公式インストール例は最近 react-router 表記が中心なので、将来的に使い分けは確認したほうがよいです。