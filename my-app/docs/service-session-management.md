# サービス起動時のセッション管理

## 目的

サービス起動（実行）を契機に、擬似DBの `service_session` テーブルへ実行履歴を追加し、
一覧・実行画面で履歴を参照できるようにする。

このドキュメントは、現在のフロント実装における起動セッション管理の仕様をまとめる。

## 管理テーブル（ダミーDB）

実装ファイル: `src/api/services/devMockServiceDb.ts`

- `service`（`ServiceRecord[]`）
  - 主な項目: `id`, `name`, `category`, `owner`, `status`, `updatedAt`
  - 保存先: `localStorage` キー `dev_mock_service_table`
- `service_session`（`ServiceSessionRecord[]`）
  - 主な項目: `id`, `serviceId`, `executedByUserId`, `executedByName`, `executedAt`, `result`
  - 保存先: `localStorage` キー `dev_mock_service_session_table`

## 実行トリガー（いつ executeService が呼ばれるか）

### トリガー元

実装ファイル: `src/pages/ServicesPage.tsx`

- サービス一覧の「実行」操作で実行画面を別ウィンドウで開く。
- 遷移URLに `executionToken` クエリを必ず付与する。
  - 例: `/services/{serviceId}/execute?executionToken=...`
- `executionToken` は以下で生成する。
  - 優先: `crypto.randomUUID()`
  - フォールバック: `Date.now()` + 乱数

### 実行タイミング

実装ファイル: `src/pages/ServiceExecutionPage.tsx`

- 実行画面表示時、以下を満たす場合に `executeService` を自動実行する。
  - `serviceId` が存在
  - 対象 `service` が存在
  - ログインユーザー情報が存在
  - `executionToken` が存在
- 手動ボタンは使わず、既存の「一覧から実行」の導線を唯一の契機にする。

## 重複実行防止

実装ファイル: `src/pages/ServiceExecutionPage.tsx`

- `sessionStorage` に `service_execute_once_${executionToken}` を記録し、二重実行を防ぐ。
- 状態管理:
  - `inflight`: 実行中
  - `done`: 完了済み
- 同じ `executionToken` で再描画されても、`inflight` / `done` の場合は再実行しない。
- 失敗時はガードキーを削除し、再試行可能にする。

この仕組みにより、React Strict Mode や再レンダーの影響で同一起動が重複登録されるリスクを低減する。

## executeService の動作

実装ファイル: `src/api/services/devMockServiceDb.ts`

`executeService(input)` の処理:

1. `serviceId` に対応する `service` の存在確認（未存在なら例外）。
2. 実行時刻 `executedAt` を ISO 形式で生成。
3. `service_session` に新規レコードを先頭追加。
4. 対象 `service.updatedAt` を実行日で更新。
5. 追加したセッションレコードを返却。

## React Query 連携

実装ファイル: `src/hooks/api/useExecuteService.ts`

- 実行は `useMutation` で行う。
- 成功時に以下のキャッシュを invalidate する。
  - `['services', 'list']`
  - `['serviceSessions', serviceId]`

実装ファイル: `src/hooks/api/useServiceSessions.ts`

- `service_session` 参照は `useQuery` で行う。
- クエリキーは `['serviceSessions', serviceId]`。
- 実行画面で履歴テーブル表示に利用する。

## 画面上の挙動

実装ファイル: `src/pages/ServiceExecutionPage.tsx`

- `executionToken` なしで直接開いた場合
  - 自動実行は行わない。
  - 「一覧の実行から開いたときに自動実行」の案内を表示。
- `executionToken` ありで開いた場合
  - 自動で executeService を実行。
  - 成功/失敗メッセージを表示。
  - `service_session` 履歴テーブルに結果が反映される。

## 既知の制約

- 擬似DBは `localStorage` のため、ブラウザ依存で永続化される。
- 実行結果 `result` は現状 `success` 固定。
- `executionToken` 自体のTTL（有効期限）は未導入。

## 今後の拡張候補

- `service_session` に実行パラメータ、実行時間、エラー詳細を追加。
- `result` を `success` / `failed` で管理。
- `executionToken` に有効期限チェックを追加し、古いURLでの起動を無効化。
