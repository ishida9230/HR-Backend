# ER図

## HRシステム データベース設計

```mermaid
erDiagram
    employees ||--o{ employee_assignments : "has"
    employees ||--o{ employee_roles : "has"
    employees ||--o{ requests : "applies"
    employees ||--o{ approval_steps : "acts"
    
    departments ||--o{ employee_assignments : "assigned_to"
    departments ||--o{ requests : "belongs_to"
    
    branches ||--o{ employee_assignments : "located_at"
    
    positions ||--o{ employee_assignments : "holds"
    
    roles ||--o{ employee_roles : "granted_to"
    
    requests ||--o{ request_items : "contains"
    requests ||--o{ approval_steps : "has"
    
    employees {
        integer id PK
        integer employee_code UK
        varchar email UK
        varchar first_name
        varchar last_name
        varchar postal_code
        varchar address
        varchar phone
        enum employment_type "正社員, 契約社員, 業務委託"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    departments {
        integer id PK
        enum name "営業部, 開発部, CS部, 管理部, 人事部"
        timestamp createdAt
        timestamp updatedAt
    }
    
    branches {
        integer id PK
        enum name "東京支店, 大阪支店, 福岡支店"
        timestamp createdAt
        timestamp updatedAt
    }
    
    positions {
        integer id PK
        enum name "平社員, 主任, 部長, 社長"
        timestamp createdAt
        timestamp updatedAt
    }
    
    roles {
        integer id PK
        varchar name
        text_array permissions
        timestamp createdAt
        timestamp updatedAt
    }
    
    employee_assignments {
        integer id PK
        integer employee_id FK
        integer department_id FK
        integer branch_id FK
        integer position_id FK
        boolean superior_flag
        timestamp start_date
        timestamp end_date
        timestamp created_at
    }
    
    employee_roles {
        integer id PK
        integer employee_id FK
        integer role_id FK
        timestamp created_at
    }
    
    requests {
        integer id PK
        integer applicant_employee_id FK
        integer applicant_department_id FK
        enum status "上長承認待ち, 人事承認待ち, 差し戻し, 完了"
        varchar title
        timestamp submitted_at
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
    
    request_items {
        integer id PK
        integer request_id FK
        varchar field_key
        text old_value
        text new_value
        timestamp created_at
    }
    
    approval_steps {
        integer id PK
        integer request_id FK
        integer step_order
        enum step_type "MANAGER, HR"
        enum status "PENDING, APPROVED, CHANGES_REQUESTED"
        integer acted_by_employee_id FK
        text comment
        timestamp acted_at
        timestamp created_at
    }
```

## テーブル説明

### マスタテーブル

- **departments** - 部署マスタ（営業部、開発部、CS部、管理部、人事部）
- **branches** - 支店マスタ（東京支店、大阪支店、福岡支店）
- **positions** - 役職マスタ（平社員、主任、部長、社長）
- **roles** - 権限ロールマスタ（権限名と権限配列）

### トランザクションテーブル

- **employees** - 従業員情報
- **employee_assignments** - 従業員の所属情報（支店×部署×役職の組み合わせ）
- **employee_roles** - 従業員の権限ロール（多対多）
- **requests** - 申請情報
- **request_items** - 申請項目（変更内容の詳細）
- **approval_steps** - 承認ステップ（上長承認、人事承認など）

## リレーションシップ

- **employees** 1:N **employee_assignments** - 1人の従業員は複数の所属情報を持つ（異動履歴）
- **employees** 1:N **employee_roles** - 1人の従業員は複数の権限ロールを持つ
- **employees** 1:N **requests** - 1人の従業員は複数の申請を作成できる
- **employees** 1:N **approval_steps** - 1人の従業員は複数の承認ステップで承認者になる
- **departments** 1:N **employee_assignments** - 1つの部署には複数の従業員が所属
- **departments** 1:N **requests** - 1つの部署から複数の申請が作成される
- **branches** 1:N **employee_assignments** - 1つの支店には複数の従業員が所属
- **positions** 1:N **employee_assignments** - 1つの役職には複数の従業員が就任
- **roles** 1:N **employee_roles** - 1つの権限ロールは複数の従業員に付与される
- **requests** 1:N **request_items** - 1つの申請には複数の申請項目がある
- **requests** 1:N **approval_steps** - 1つの申請には複数の承認ステップがある
