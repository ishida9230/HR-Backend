# APIエラーレスポンス仕様

## エラーレスポンス形式

すべてのエラーレスポンスは以下の統一された形式で返却されます：

```json
{
  "error": {
    "code": 400,
    "message": "エラーメッセージ",
    "details": {
      // オプション: エラーの詳細情報
    }
  }
}
```

### レスポンスフィールド

- `error.code` (number): HTTPステータスコードと同じ値
- `error.message` (string): エラーメッセージ（日本語）
- `error.details` (object, オプション): エラーの詳細情報

---

## エラーケース一覧

### 1. 400 Bad Request - バリデーションエラー

#### 1.1 従業員IDが不正な場合

**エンドポイント**: `GET /api/employees/:id`

**条件**: 従業員IDが正の整数でない場合

**レスポンス例**:
```json
{
  "error": {
    "code": 400,
    "message": "従業員IDが不正です",
    "details": {
      "employeeId": "abc"
    }
  }
}
```

**発生箇所**: `employee.controller.ts` (19行目)

---

### 2. 404 Not Found - リソースが見つからない

#### 2.1 従業員が見つからない場合

**エンドポイント**: `GET /api/employees/:id`

**条件**: 指定されたIDの従業員が存在しない、または非アクティブな場合

**レスポンス例**:
```json
{
  "error": {
    "code": 404,
    "message": "employee with id 9999 not found",
    "details": {
      "id": 9999,
      "resource": "employee"
    }
  }
}
```

**発生箇所**: `employee.repository.ts` (38行目) → `RecordNotFoundException`

#### 2.2 エンドポイントが見つからない場合

**エンドポイント**: 存在しないエンドポイント

**レスポンス例**:
```json
{
  "error": {
    "code": 404,
    "message": "エンドポイントが見つかりません"
  }
}
```

**発生箇所**: `app.ts` (43-49行目)

---

### 3. 500 Internal Server Error - サーバーエラー

**条件**: 予期しないエラーが発生した場合

**レスポンス例**:
```json
{
  "error": {
    "code": 500,
    "message": "サーバーでエラーが発生しました"
  }
}
```

**発生箇所**: `error.middleware.ts` (13-14行目)

---

## HTTPステータスコード一覧

| ステータスコード | 意味 | 発生条件 |
|----------------|------|----------|
| 400 | Bad Request | リクエストパラメータが不正 |
| 404 | Not Found | リソースが見つからない、エンドポイントが存在しない |
| 500 | Internal Server Error | サーバー内部エラー |

---

## エラーハンドリングの推奨事項

### フロントエンド側での処理

1. **400 Bad Request**: ユーザーに再入力を促す
2. **404 Not Found**: 
   - 従業員が見つからない場合: 「指定された従業員が見つかりませんでした」と表示
   - エンドポイントが見つからない場合: 「ページが見つかりませんでした」と表示
3. **500 Internal Server Error**: 「サーバーでエラーが発生しました。しばらくしてから再度お試しください」と表示

### エラーメッセージの表示

- `error.message`をそのまま表示するか、ユーザーフレンドリーなメッセージに変換
- `error.details`があれば、詳細情報をログに記録（開発環境のみ）

---

## 実装例

### TypeScript型定義

```typescript
export interface ApiErrorResponse {
  error: {
    code: number;
    message: string;
    details?: {
      employeeId?: string | number;
      id?: number;
      resource?: string;
      parameter?: string;
      reason?: string;
      [key: string]: unknown;
    };
  };
}
```

### エラーハンドリング例

```typescript
try {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`);
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    
    switch (errorData.error.code) {
      case 400:
        // バリデーションエラー
        console.error("バリデーションエラー:", errorData.error.message);
        break;
      case 404:
        // リソースが見つからない
        console.error("リソースが見つかりません:", errorData.error.message);
        break;
      case 500:
        // サーバーエラー
        console.error("サーバーエラー:", errorData.error.message);
        break;
    }
  }
} catch (error) {
  // ネットワークエラーなど
  console.error("ネットワークエラー:", error);
}
```
