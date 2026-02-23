# プロフィール取得API設計書

## API概要

- **エンドポイント**: `GET /api/employees/:id`
- **説明**: 指定された従業員IDのプロフィール情報を取得する
- **認証**: 現在は未実装（将来的に認証が必要）

---

## 1. リクエスト仕様

### 1.1 HTTPメソッドとエンドポイント
```
GET /api/employees/:id
```

### 1.2 パスパラメータ
| パラメータ名 | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `id` | number | 必須 | 従業員ID |

### 1.3 クエリパラメータ
現時点では不要。将来的に以下のような拡張が考えられる：
- `fields` (string[]): 取得するフィールドを指定

**注意**: `is_active = true`の従業員のみ取得します。非アクティブな従業員は取得対象外です。

### 1.4 リクエストヘッダー
```
Content-Type: application/json
Accept: application/json
```

### 1.5 リクエスト例
```http
GET /api/employees/1 HTTP/1.1
Host: localhost:3000
Accept: application/json
```

---

## 2. レスポンス仕様

### 2.1 成功時のレスポンス（200 OK）

#### レスポンスボディ構造
```typescript
interface EmployeeProfileResponse {
  id: number;
  employeeCode: number;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  address: string;
  phone: string;
  employmentType: "正社員" | "契約社員" | "業務委託";
  isActive: boolean;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  assignments: EmployeeAssignment[];
}

interface EmployeeAssignment {
  id: number;
  employeeId: number;
  departmentId: number;
  branchId: number;
  positionId: number;
  superiorFlag: boolean;
  startDate: string; // ISO 8601形式
  endDate: string | null; // ISO 8601形式
  createdAt: string; // ISO 8601形式
  department: {
    id: number;
    name: string;
  };
  branch: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
  };
}
```

#### レスポンス例
```json
{
  "id": 1,
  "employeeCode": 10001,
  "email": "yamada@example.com",
  "firstName": "太郎",
  "lastName": "山田",
  "postalCode": "100-0001",
  "address": "東京都千代田区千代田1-1",
  "phone": "03-1234-5678",
  "employmentType": "正社員",
  "isActive": true,
  "createdAt": "2020-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "assignments": [
    {
      "id": 1,
      "employeeId": 1,
      "departmentId": 1,
      "branchId": 1,
      "positionId": 1,
      "superiorFlag": false,
      "startDate": "2020-01-01T00:00:00.000Z",
      "endDate": null,
      "createdAt": "2020-01-01T00:00:00.000Z",
      "department": {
        "id": 1,
        "name": "営業部"
      },
      "branch": {
        "id": 1,
        "name": "東京支店"
      },
      "position": {
        "id": 1,
        "name": "平社員"
      }
    }
  ]
}
```

### 2.2 エラーレスポンス

#### 404 Not Found（従業員が存在しない場合）
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

#### 400 Bad Request（不正なID形式）
```json
{
  "error": {
    "code": "INVALID_EMPLOYEE_ID",
    "message": "従業員IDが不正です",
    "details": {
      "employeeId": "invalid"
    }
  }
}
```

#### 500 Internal Server Error（サーバーエラー）
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "サーバーでエラーが発生しました"
  }
}
```

---

## 3. データ取得ロジック

### 3.1 取得するテーブル
- `employees` - 従業員基本情報
- `employee_assignments` - 従業員の所属情報（部署、支店、役職）
- `departments` - 部署マスタ
- `branches` - 支店マスタ
- `positions` - 役職マスタ

### 3.2 フィルタリング条件
- `employee_assignments.end_date IS NULL` - 現在有効な所属情報のみ取得
- `employees.is_active = true` - アクティブな従業員のみ取得（必須）

### 3.3 データ結合方法
TypeORMの`relations`を使用して、以下のリレーションを一度に取得：
- `assignments` - 従業員の所属情報
- `assignments.department` - 部署情報
- `assignments.branch` - 支店情報
- `assignments.position` - 役職情報

### 3.4 クエリ例（TypeORM）
```typescript
const employee = await employeeRepository.findOne({
  where: { id: employeeId },
  relations: [
    'assignments',
    'assignments.department',
    'assignments.branch',
    'assignments.position'
  ]
});

// end_dateがnullのもののみフィルタリング
const activeAssignments = employee.assignments.filter(
  assignment => assignment.endDate === null
);
```

---

## 4. エラーハンドリング

### 4.1 エラーケースと対応

| エラーケース | HTTPステータス | エラーコード | 処理 |
|------------|---------------|------------|------|
| 従業員IDが存在しない | 404 | `EMPLOYEE_NOT_FOUND` | エラーレスポンスを返す |
| 従業員IDが数値でない | 400 | `INVALID_EMPLOYEE_ID` | バリデーションエラーを返す |
| データベース接続エラー | 500 | `DATABASE_ERROR` | サーバーエラーを返す |
| 予期しないエラー | 500 | `INTERNAL_SERVER_ERROR` | サーバーエラーを返す |

### 4.2 エラーレスポンス形式
すべてのエラーレスポンスは統一された形式：
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

---

## 5. パフォーマンス考慮事項

### 5.1 N+1問題の回避
- TypeORMの`relations`を使用して、必要なデータを一度のクエリで取得
- 複数のクエリを実行しない

### 5.2 キャッシュ
- 現時点ではキャッシュは実装しない
- 将来的にRedis等を使用したキャッシュを検討

### 5.3 インデックス
- `employees.id` - 主キー（自動的にインデックス）
- `employee_assignments.employee_id` - 外部キー（自動的にインデックス）
- `employee_assignments.end_date` - フィルタリング条件（必要に応じてインデックス追加）

---

## 6. セキュリティ考慮事項

### 6.1 認証・認可
- 現時点では認証は未実装
- 将来的にJWT認証を実装
- 自分自身のプロフィールのみ取得可能にする（または管理者権限が必要）

### 6.2 データ漏洩対策
- 機密情報（パスワード等）は含めない
- 必要最小限の情報のみ返す

### 6.3 入力検証
- 従業員IDが数値であることを確認
- SQLインジェクション対策（TypeORMのパラメータ化クエリを使用）

---

## 7. 実装ファイル構成

### 7.1 バックエンド
```
backend/src/
├── controllers/
│   └── employees.controller.ts  # コントローラー
├── services/
│   └── employees.service.ts     # ビジネスロジック
├── routes/
│   └── employees.routes.ts      # ルーティング
└── app.ts                        # ルーティング登録
```

### 7.2 実装順序
1. DTO（Data Transfer Object）の定義
2. Service層の実装（データ取得ロジック）
3. Controller層の実装（HTTPリクエスト/レスポンス処理）
4. Route層の実装（ルーティング定義）
5. エラーハンドリングの実装
6. テスト

---

## 8. 決定が必要な項目

### 8.1 必須項目（実装前に決定）
- [x] エンドポイント: `GET /api/employees/:id`
- [x] レスポンス構造: 上記のJSON構造
- [x] フィルタリング条件: `end_date IS NULL`の所属情報のみ
- [ ] エラーレスポンス形式: 統一されたエラー形式を使用
- [ ] 日付形式: ISO 8601形式（`YYYY-MM-DDTHH:mm:ss.sssZ`）

### 8.2 オプション項目（後で決定可能）
- [ ] 非アクティブな従業員も取得可能にするか
- [ ] キャッシュの実装
- [ ] ページネーション（assignmentsが大量の場合）
- [ ] フィールド選択（必要なフィールドのみ取得）

---

## 9. テストケース

### 9.1 正常系
- [ ] 存在する従業員IDでプロフィールを取得できる
- [ ] 複数の所属情報がある場合、すべて取得できる
- [ ] `end_date`がnullの所属情報のみ取得される

### 9.2 異常系
- [ ] 存在しない従業員IDで404エラーが返る
- [ ] 不正なID形式で400エラーが返る
- [ ] データベースエラー時に500エラーが返る

---

## 10. 参考資料

- [Microsoft Learn - Web API Design Best Practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- TypeORM公式ドキュメント: Relations
- Express.js公式ドキュメント: Routing
