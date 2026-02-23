# 実装ステップ: プロフィールページ・変更申請ページ

## 概要

プロフィールページと変更申請ページの実装を行います。

## AC（受け入れ基準）

### プロフィールページ
- 氏名、メールアドレス、電話番号、郵便番号、住所を表示
- 部署（複数）、支店（複数）、役職（複数）を表示

### 変更申請ページ
- 氏名、メールアドレス、電話番号、郵便番号、住所の入力フォーム
- 部署、支店、役職のセレクトボックス（複数選択可能）
- 変更内容の入力フォーム
- 登録処理ができること

### テスト
- プロフィールページ、変更申請ページが作成されていること
- ACの項目が表示されていること
- 変更申請ページで登録処理ができること

### やらないこと
- 履歴、ログの登録

---

## API設計

RESTful API設計のベストプラクティスに基づいたAPIエンドポイント設計です。

### マスタデータ取得API
- `GET /api/departments` - 部署一覧取得
- `GET /api/branches` - 支店一覧取得
- `GET /api/positions` - 役職一覧取得

### 従業員プロフィール取得API
- `GET /api/employees/:id` - 従業員プロフィール取得
  - 従業員基本情報
  - 複数の部署/支店/役職（employee_assignmentsから取得、end_dateがnullのもの）

### 変更申請作成API
- `POST /api/requests` - 変更申請作成
  - リクエストボディ:
    - `applicantEmployeeId`: number
    - `applicantDepartmentId`: number
    - `title`: string
    - `items`: Array<{ fieldKey: string, oldValue: string | null, newValue: string | null }>

---

## 実装ステップ

### Phase 1: プロフィールページUI実装（フロントエンド）

#### Step 1-1: モックデータ定義
- [x] `frontend/src/lib/mocks/profile.ts` - プロフィール用モックデータ作成
- [x] `frontend/src/lib/mocks/masters.ts` - マスタデータ用モックデータ作成

#### Step 1-2: プロフィールページUI作成
- [ x] `frontend/src/app/profile/page.tsx` を実装
- [x ] プロフィール情報表示コンポーネント作成
  - 氏名、メールアドレス、電話番号、郵便番号、住所
  - 部署リスト（複数表示）
  - 支店リスト（複数表示）
  - 役職リスト（複数表示）
- [ x] モックデータを使用して表示
- [ ] ローディング状態の表示（将来用）
- [ ] エラー状態の表示（将来用）

#### Step 1-3: スタイリング
- [x ] shadcn/uiコンポーネントを使用
- [x ] デザイン調整

---

### Phase 2: プロフィールページAPI実装（バックエンド）

#### Step 2-1: マスタデータ取得API
- [ ] `GET /api/departments` - 部署一覧取得
- [ ] `GET /api/branches` - 支店一覧取得
- [ ] `GET /api/positions` - 役職一覧取得
- [ ] コントローラー作成: `backend/src/controllers/departments.controller.ts`
- [ ] コントローラー作成: `backend/src/controllers/branches.controller.ts`
- [ ] コントローラー作成: `backend/src/controllers/positions.controller.ts`
- [ ] ルーティング追加: `backend/src/routes/departments.routes.ts`
- [ ] ルーティング追加: `backend/src/routes/branches.routes.ts`
- [ ] ルーティング追加: `backend/src/routes/positions.routes.ts`

#### Step 2-2: プロフィール取得API
- [ ] `GET /api/employees/:id` - 従業員プロフィール取得
  - 従業員基本情報
  - 複数の部署/支店/役職（employee_assignmentsから取得、end_dateがnullのもの）
- [ ] コントローラー作成: `backend/src/controllers/employees.controller.ts`
- [ ] サービス作成: `backend/src/services/employees.service.ts`
- [ ] ルーティング追加: `backend/src/routes/employees.routes.ts`

#### Step 2-3: API統合
- [ ] `backend/src/app.ts`にルーティングを追加
- [ ] CORS設定の確認
- [ ] エラーハンドリングの実装

#### Step 2-4: フロントエンドAPIクライアント実装
- [ ] `frontend/src/lib/api/client.ts` - APIクライアントベース
- [ ] `frontend/src/lib/api/departments.ts` - 部署データ取得関数
  - `getDepartments()`
- [ ] `frontend/src/lib/api/branches.ts` - 支店データ取得関数
  - `getBranches()`
- [ ] `frontend/src/lib/api/positions.ts` - 役職データ取得関数
  - `getPositions()`
- [ ] `frontend/src/lib/api/employees.ts` - 従業員関連API関数
  - `getEmployee(id: number)` - 従業員プロフィール取得

#### Step 2-5: TanStack Queryフック作成
- [ ] `frontend/src/hooks/use-departments.ts` - 部署データ取得フック
- [ ] `frontend/src/hooks/use-branches.ts` - 支店データ取得フック
- [ ] `frontend/src/hooks/use-positions.ts` - 役職データ取得フック
- [ ] `frontend/src/hooks/use-employee.ts` - 従業員プロフィール取得フック

#### Step 2-6: プロフィールページのAPI統合
- [ ] モックデータをAPI呼び出しに置き換え
- [ ] TanStack Queryフックを使用
- [ ] ローディング・エラー状態の実装

---

### Phase 3: プロフィール変更ページUI実装（フロントエンド）

#### Step 3-1: プロフィール変更ページUI作成
- [ ] `frontend/src/app/profile/edit/page.tsx` を作成
- [ ] フォームコンポーネント作成
  - 氏名入力フォーム
  - メールアドレス入力フォーム
  - 電話番号入力フォーム
  - 郵便番号入力フォーム
  - 住所入力フォーム
  - 部署セレクトボックス（複数選択）
  - 支店セレクトボックス（複数選択）
  - 役職セレクトボックス（複数選択）
  - 変更内容入力フォーム（テキストエリア）

#### Step 3-2: フォームバリデーション
- [ ] react-hook-form + zodでバリデーション実装
- [ ] バリデーションスキーマ定義
- [ ] エラーメッセージ表示
- [ ] モックデータをセレクトボックスに設定

#### Step 3-3: フォーム送信処理（モック）
- [ ] フォーム送信ハンドラー実装（モック）
- [ ] 送信データのコンソール出力（デバッグ用）
- [ ] 成功時の処理（アラート表示）
- [ ] エラー時の処理（アラート表示）

#### Step 3-4: スタイリング
- [ ] shadcn/uiコンポーネントを使用
- [ ] デザイン調整

#### Step 3-5: プロフィールページへの遷移ボタン追加
- [ ] プロフィールページに「変更申請」ボタンを追加
- [ ] ボタンクリックでプロフィール変更ページ（`/profile/edit`）に遷移
- [ ] Next.jsの`useRouter`を使用してナビゲーション実装

---

### Phase 4: プロフィール変更ページAPI実装（バックエンド）

#### Step 4-1: 変更申請作成API
- [ ] `POST /api/requests` - 変更申請作成
  - リクエストボディ:
    - `applicantEmployeeId`: number
    - `applicantDepartmentId`: number
    - `title`: string
    - `items`: Array<{ fieldKey: string, oldValue: string | null, newValue: string | null }>
- [ ] コントローラー作成: `backend/src/controllers/requests.controller.ts`
- [ ] サービス作成: `backend/src/services/requests.service.ts`
- [ ] ルーティング追加: `backend/src/routes/requests.routes.ts`
- [ ] バリデーション追加（class-validator使用）

#### Step 4-2: API統合
- [ ] `backend/src/app.ts`にルーティングを追加
- [ ] CORS設定の確認
- [ ] エラーハンドリングの実装

#### Step 4-3: フロントエンドAPIクライアント実装
- [ ] `frontend/src/lib/api/requests.ts` - 変更申請関連API関数
  - `createRequest(data: CreateRequestData)`

#### Step 4-4: TanStack Queryフック作成
- [ ] `frontend/src/hooks/use-create-request.ts` - 変更申請作成フック

#### Step 4-5: プロフィール変更ページのAPI統合
- [ ] モック送信処理をAPI呼び出しに置き換え
- [ ] TanStack Queryフックを使用
- [ ] 成功・エラー時の処理を実装

---

### Phase 5: テスト

#### Step 7-1: 手動テスト
- [ ] プロフィールページが表示されること
- [ ] ACの項目が全て表示されていること
- [ ] 変更申請ページが表示されること
- [ ] フォーム入力ができること
- [ ] バリデーションが動作すること
- [ ] 変更申請の登録処理ができること
- [ ] エラーハンドリングが動作すること

#### Step 7-2: 動作確認
- [ ] ブラウザで実際に操作して確認
- [ ] レスポンシブデザインの確認
- [ ] ローディング状態の確認
- [ ] エラー状態の確認

---

## 技術スタック

### バックエンド
- Express.js
- TypeORM
- class-validator（バリデーション）

### フロントエンド
- Next.js (App Router)
- TanStack Query（データフェッチング）
- react-hook-form + zod（フォーム管理・バリデーション）
- shadcn/ui（UIコンポーネント）
- Tailwind CSS（スタイリング）

---

## 注意事項

1. **複数の部署/支店/役職について**
   - `employee_assignments`テーブルから、`end_date`が`null`のレコードを取得
   - 1人の従業員が複数の所属情報を持つ可能性がある（異動履歴）

2. **変更申請のデータ構造**
   - `requests`テーブルに申請情報を保存
   - `request_items`テーブルに変更内容の詳細を保存
   - 各フィールドの変更を`request_items`に記録

3. **認証について**
   - 現在認証はコメントアウトされているため、開発用の従業員IDを使用
   - 将来的に認証を有効化する際は、認証情報から従業員IDを取得

---

## 実装順序の推奨

### ページ単位での実装アプローチ（推奨）

1. **プロフィールページUI実装**（Phase 1）
   - モックデータを使用してUIを作成
   - スタイリングとレイアウトを確定

2. **プロフィールページAPI実装**（Phase 2）
   - バックエンドAPI実装
     - `GET /api/departments` - 部署一覧取得
     - `GET /api/branches` - 支店一覧取得
     - `GET /api/positions` - 役職一覧取得
     - `GET /api/employees/:id` - 従業員プロフィール取得
   - フロントエンドAPIクライアント実装
   - UIとAPIの統合
   - プロフィールページの完成

3. **プロフィール変更ページUI実装**（Phase 3）
   - モックデータを使用してフォームを作成
   - バリデーション実装
   - スタイリングとレイアウトを確定
   - プロフィールページへの遷移ボタン追加

4. **プロフィール変更ページAPI実装**（Phase 4）
   - バックエンドAPI実装（変更申請作成）
   - フロントエンドAPIクライアント実装
   - UIとAPIの統合
   - プロフィール変更ページの完成

5. **テスト**（Phase 5）
   - 動作確認とテスト

### メリット

- ページ単位で完成させられるため、進捗が明確
- プロフィールページを先に完成させることで、変更ページの実装時に参照できる
- 各ページのFEとBEを連続して実装することで、統合時の問題を早期に発見できる
- モックデータからAPI実装への移行がスムーズ
