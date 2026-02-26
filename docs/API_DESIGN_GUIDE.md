# API設計ガイドライン

## 1. HTTPヘッダーの意味

### 1.1 Content-Type
**意味**: リクエストボディのデータ形式を指定

```
Content-Type: application/json
```

- **送信側（クライアント）**: サーバーに送るデータがJSON形式であることを示す
- **受信側（サーバー）**: リクエストボディをJSONとして解釈する

**例**:
```http
POST /api/requests HTTP/1.1
Content-Type: application/json

{
  "title": "プロフィール変更申請",
  "items": [...]
}
```

### 1.2 Accept
**意味**: クライアントが受け取れるレスポンスのデータ形式を指定

```
Accept: application/json
```

- **送信側（クライアント）**: JSON形式のレスポンスを希望することを示す
- **受信側（サーバー）**: JSON形式でレスポンスを返す

**例**:
```http
GET /api/employees/1 HTTP/1.1
Accept: application/json
```

### 1.3 なぜ両方必要か？
- **Content-Type**: リクエストボディがある場合（POST, PUT, PATCH）に必要
- **Accept**: クライアントが希望するレスポンス形式を指定（サーバーが対応している場合）

**GETリクエストの場合**:
- `Content-Type`は通常不要（リクエストボディがないため）
- `Accept`は推奨（サーバーが適切な形式で返すため）

---

## 2. API設計時に決めるべき項目一覧

### 2.1 エンドポイント設計

| 項目 | 説明 | 例 |
|------|------|-----|
| **HTTPメソッド** | GET, POST, PUT, PATCH, DELETE | `GET /api/employees/:id` |
| **URLパス** | リソースを表現するパス | `/api/employees/:id` |
| **パスパラメータ** | URLに含まれる変数 | `:id` |
| **クエリパラメータ** | URLの`?`以降のパラメータ | `?page=1&limit=10` |
| **リクエストボディ** | POST/PUT/PATCHで送るデータ | JSON形式 |

### 2.2 リクエスト仕様

| 項目 | 説明 | 決定事項 |
|------|------|---------|
| **HTTPメソッド** | 操作の種類 | GET, POST, PUT, PATCH, DELETE |
| **エンドポイント** | リソースのURL | `/api/employees/:id` |
| **パスパラメータ** | URL内の変数 | `id: number` |
| **クエリパラメータ** | フィルタリング・ページネーション | `?page=1&limit=10` |
| **リクエストヘッダー** | 認証、Content-Type等 | `Authorization: Bearer <token>` |
| **リクエストボディ** | 送信するデータ構造 | JSON形式のDTO |

### 2.3 レスポンス仕様

| 項目 | 説明 | 決定事項 |
|------|------|---------|
| **HTTPステータスコード** | 200, 201, 400, 404, 500等 | 成功/エラーの種類 |
| **レスポンスボディ構造** | 返すデータの形式 | JSON形式のDTO |
| **日付形式** | ISO 8601形式か、タイムスタンプか | `YYYY-MM-DDTHH:mm:ss.sssZ` |
| **エラーレスポンス形式** | 統一されたエラー形式 | `{ error: { code, message } }` |

### 2.4 データ取得ロジック

| 項目 | 説明 | 決定事項 |
|------|------|---------|
| **取得するテーブル** | どのテーブルから取得するか | `employees`, `employee_assignments` |
| **結合方法** | JOIN, TypeORM relations | `relations: ['assignments']` |
| **フィルタリング条件** | WHERE句の条件 | `end_date IS NULL`, `is_active = true` |
| **ソート順** | ORDER BY句 | `createdAt DESC` |
| **ページネーション** | 大量データの分割取得 | `limit`, `offset` |

### 2.5 エラーハンドリング

| 項目 | 説明 | 決定事項 |
|------|------|---------|
| **エラーコード体系** | 統一されたエラーコード | `EMPLOYEE_NOT_FOUND` |
| **エラーレスポンス形式** | 統一されたエラー形式 | `{ error: { code, message, details } }` |
| **HTTPステータスコード** | エラーの種類に応じたステータス | 400, 404, 500等 |
| **ログ出力** | エラー時のログ出力方法 | サーバーログに記録 |

### 2.6 セキュリティ

| 項目 | 説明 | 決定事項 |
|------|------|---------|
| **認証方式** | JWT, OAuth等 | JWT（将来実装） |
| **認可** | 権限チェック | 自分自身のみ取得可能 |
| **入力検証** | バリデーション | class-validator使用 |
| **SQLインジェクション対策** | パラメータ化クエリ | TypeORMが自動対応 |

### 2.7 パフォーマンス

| 項目 | 説明 | 決定事項 |
|------|------|---------|
| **N+1問題の回避** | リレーションの一括取得 | `relations`を使用 |
| **キャッシュ** | Redis等のキャッシュ | 現時点では不要 |
| **インデックス** | データベースのインデックス | 必要に応じて追加 |
| **ページネーション** | 大量データの分割取得 | 必要に応じて実装 |

---

## 3. 基本的なエラーレスポンスコード

### 3.1 HTTPステータスコード

| ステータスコード | 意味 | 使用例 |
|----------------|------|--------|
| **200 OK** | リクエスト成功 | GET, PUT, PATCH成功時 |
| **201 Created** | リソース作成成功 | POST成功時 |
| **204 No Content** | 成功（レスポンスボディなし） | DELETE成功時 |
| **400 Bad Request** | リクエストが不正 | バリデーションエラー |
| **401 Unauthorized** | 認証が必要 | 認証トークンがない |
| **403 Forbidden** | 権限がない | アクセス権限がない |
| **404 Not Found** | リソースが見つからない | 存在しないID |
| **409 Conflict** | 競合 | 重複データ |
| **422 Unprocessable Entity** | 処理できないエンティティ | ビジネスロジックエラー |
| **500 Internal Server Error** | サーバーエラー | 予期しないエラー |

### 3.2 エラーコード体系

#### 3.2.1 命名規則
- **大文字とアンダースコア**: `EMPLOYEE_NOT_FOUND`
- **リソース名_エラー種別**: `EMPLOYEE_NOT_FOUND`, `DEPARTMENT_INVALID`

#### 3.2.2 基本的なエラーコード一覧

| エラーコード | HTTPステータス | 説明 | 使用例 |
|------------|---------------|------|--------|
| `INVALID_REQUEST` | 400 | リクエストが不正 | 必須パラメータがない |
| `INVALID_EMPLOYEE_ID` | 400 | 従業員IDが不正 | 数値でないID |
| `EMPLOYEE_NOT_FOUND` | 404 | 従業員が見つからない | 存在しないID |
| `DEPARTMENT_NOT_FOUND` | 404 | 部署が見つからない | 存在しない部署ID |
| `BRANCH_NOT_FOUND` | 404 | 支店が見つからない | 存在しない支店ID |
| `POSITION_NOT_FOUND` | 404 | 役職が見つからない | 存在しない役職ID |
| `UNAUTHORIZED` | 401 | 認証が必要 | 認証トークンがない |
| `FORBIDDEN` | 403 | 権限がない | アクセス権限がない |
| `VALIDATION_ERROR` | 400 | バリデーションエラー | 入力値が不正 |
| `DATABASE_ERROR` | 500 | データベースエラー | 接続エラー |
| `INTERNAL_SERVER_ERROR` | 500 | サーバーエラー | 予期しないエラー |

### 3.3 エラーレスポンス形式

#### 3.3.1 統一されたエラーレスポンス形式
```typescript
interface ErrorResponse {
  error: {
    code: string;           // エラーコード
    message: string;         // エラーメッセージ（ユーザー向け）
    details?: Record<string, any>; // エラー詳細（デバッグ用）
  };
}
```

#### 3.3.2 エラーレスポンス例

**404 Not Found**:
```json
{
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "従業員が見つかりませんでした",
    "details": {
      "employeeId": 999
    }
  }
}
```

**400 Bad Request**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": {
      "field": "email",
      "reason": "メールアドレスの形式が正しくありません"
    }
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "サーバーでエラーが発生しました"
  }
}
```

---

## 4. 日付をstringで返すかdateで返すかの考え方

### 4.1 推奨: string（ISO 8601形式）で返す

#### 4.1.1 理由

1. **JSONの制約**
   - JSONにはDate型がない
   - 日付は文字列として表現する必要がある

2. **言語・フレームワーク非依存**
   - JavaScript, Python, Java等、どの言語でも扱いやすい
   - タイムゾーン情報を含められる

3. **一貫性**
   - すべての日付を同じ形式で統一できる
   - パースエラーを防げる

4. **明確性**
   - ISO 8601形式は国際標準
   - タイムゾーン情報が明確

#### 4.1.2 ISO 8601形式の例
```json
{
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:30:45.123Z",
  "startDate": "2020-01-01T00:00:00.000Z"
}
```

**形式**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- `T`: 日付と時刻の区切り
- `Z`: UTC（協定世界時）を表す
- `.sss`: ミリ秒（オプション）

### 4.2 タイムスタンプ（数値）で返す場合

#### 4.2.1 メリット
- 数値として扱える（計算が容易）
- データサイズが小さい

#### 4.2.2 デメリット
- 可読性が低い
- タイムゾーン情報がない
- ミリ秒か秒かが不明確

**例**:
```json
{
  "createdAt": 1704067200000  // 何の日付か分かりにくい
}
```

### 4.3 推奨される実装

#### 4.3.1 バックエンド（TypeORM）
```typescript
// エンティティではDate型を使用
@CreateDateColumn({ type: "timestamp" })
createdAt: Date;

// レスポンスではISO 8601形式の文字列に変換
const response = {
  ...employee,
  createdAt: employee.createdAt.toISOString(),
  updatedAt: employee.updatedAt.toISOString(),
};
```

#### 4.3.2 フロントエンド（TypeScript）
```typescript
// APIから受け取る型定義
interface EmployeeProfile {
  createdAt: string;  // ISO 8601形式の文字列
  updatedAt: string;
}

// 必要に応じてDate型に変換
const createdAt = new Date(employee.createdAt);
```

### 4.4 まとめ

| 方式 | 推奨度 | 理由 |
|------|--------|------|
| **string (ISO 8601)** | ⭐⭐⭐⭐⭐ | 標準的、明確、タイムゾーン情報あり |
| **number (timestamp)** | ⭐⭐ | 計算は容易だが可読性が低い |
| **string (独自形式)** | ⭐ | 標準的でないため非推奨 |

**結論**: **ISO 8601形式の文字列（string）で返すことを強く推奨**

---

## 5. 実装チェックリスト

API実装前に以下を確認：

- [ ] エンドポイントとHTTPメソッドが決定している
- [ ] リクエスト/レスポンスのDTOが定義されている
- [ ] エラーレスポンス形式が統一されている
- [ ] エラーコード体系が決定している
- [ ] 日付形式が決定している（ISO 8601推奨）
- [ ] フィルタリング条件が明確になっている
- [ ] データ取得方法（relations等）が決定している
- [ ] エラーハンドリングの方針が決定している

---

## 参考資料

- [RFC 7231 - HTTP/1.1 Semantics and Content](https://tools.ietf.org/html/rfc7231)
- [ISO 8601 - Date and time format](https://en.wikipedia.org/wiki/ISO_8601)
- [Microsoft Learn - Web API Design Best Practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
