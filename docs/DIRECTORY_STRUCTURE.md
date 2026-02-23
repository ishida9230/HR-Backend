# バックエンド ディレクトリ構成

## 全体構成

```
backend/
├── docs/                      # ドキュメント
│   ├── DIRECTORY_STRUCTURE.md # 本ファイル（ディレクトリ構成）
│   ├── API_DESIGN_GUIDE.md    # API設計ガイドライン
│   ├── API_DESIGN_PROFILE.md  # プロフィール取得API設計書
│   ├── ER_DIAGRAM.md          # ER図
│   └── IMPLEMENTATION_STEPS.md # 実装ステップ
├── src/                       # ソースコード
│   ├── config/                # 設定
│   ├── controllers/            # コントローラー（HTTPリクエスト/レスポンス処理）
│   ├── services/              # サービス（ビジネスロジック）
│   ├── repositories/           # リポジトリ（データアクセス層）
│   ├── dtos/                  # データ転送オブジェクト
│   ├── entities/              # エンティティ（DBテーブル定義）
│   ├── exceptions/            # 例外クラス
│   ├── interfaces/            # インターフェース定義
│   ├── middleware/            # ミドルウェア
│   ├── migrations/            # マイグレーション
│   ├── scripts/               # スクリプト
│   ├── seeds/                 # シードスクリプト
│   ├── utils/                 # ユーティリティ
│   ├── app.ts                 # Expressアプリ設定
│   └── index.ts               # エントリーポイント
├── dist/                      # ビルド出力（自動生成）
├── node_modules/              # 依存パッケージ（自動生成）
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## src/ ディレクトリ詳細

```
src/
├── config/                    # 設定ファイル
│   └── database.ts            # TypeORM データソース設定
│
├── controllers/               # コントローラー（HTTPリクエスト/レスポンス処理）
│   ├── employee.controller.ts # 従業員関連コントローラー
│   └── auth.controller.ts     # 認証関連コントローラー
│
├── services/                  # サービス（ビジネスロジック）
│   ├── employee.service.ts    # 従業員関連サービス
│   └── auth.service.ts        # 認証関連サービス
│
├── repositories/              # リポジトリ（データアクセス層）
│   ├── employee.repository.ts # 従業員関連リポジトリ
│   └── auth.repository.ts     # 認証関連リポジトリ
│
├── dtos/                      # データ転送オブジェクト
│   ├── employee.dto.ts        # 従業員関連DTO
│   └── auth.dto.ts            # 認証関連DTO
│
├── entities/                  # エンティティ（DBテーブル定義）
│   ├── Employee.ts            # 従業員テーブル
│   ├── EmployeeAssignment.ts  # 従業員所属テーブル
│   ├── Department.ts          # 部署テーブル
│   ├── Branch.ts              # 支店テーブル
│   ├── Position.ts            # 役職テーブル
│   └── ...                    # その他のエンティティ
│
├── exceptions/                # 例外クラス
│   ├── HttpException.ts       # 基底例外クラス
│   ├── RecordNotFoundException.ts    # レコード未検出例外
│   └── InvalidParameterException.ts  # 不正パラメータ例外
│
├── interfaces/                # インターフェース定義
│   └── controller.interface.ts # コントローラーインターフェース
│
├── middleware/                # ミドルウェア
│   ├── auth.middleware.ts     # JWT認証ミドルウェア
│   └── error.middleware.ts    # エラーハンドリングミドルウェア
│
├── migrations/                # マイグレーション
│   └── *-CreateHRSystemTables.ts # テーブル作成マイグレーション
│
├── scripts/                   # スクリプト
│   └── drop-all-tables.ts     # 全テーブル削除スクリプト
│
├── seeds/                     # シードデータ
│   ├── seed.ts                # 初期データ投入スクリプト
│   ├── employees.ts           # 従業員シード
│   ├── departments.ts          # 部署シード
│   └── ...                    # その他のシード
│
├── utils/                     # ユーティリティ関数
│   └── formatter.ts           # フォーマット関連ユーティリティ
│
├── app.ts                     # Expressアプリケーション設定
└── index.ts                   # エントリーポイント（サーバー起動）
```

---

## 各ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| **config/** | DB接続、環境変数などの設定 |
| **controllers/** | HTTPリクエスト/レスポンス処理、パラメータバリデーション |
| **services/** | ビジネスロジック、データ変換、複数リポジトリの調整 |
| **repositories/** | データアクセス層（DB操作、エンティティの取得・保存） |
| **dtos/** | データ転送オブジェクト（リクエスト/レスポンスの型定義） |
| **entities/** | TypeORMエンティティ（DBテーブル定義） |
| **exceptions/** | 例外クラス定義（HttpExceptionを基底とする） |
| **interfaces/** | TypeScriptインターフェース定義 |
| **middleware/** | 認証、ログ、エラーハンドリングなど |
| **migrations/** | データベースマイグレーション |
| **scripts/** | データベース操作などのスクリプト |
| **seeds/** | 初期データ投入スクリプト |
| **utils/** | 共通ユーティリティ関数 |

---

## リクエストの流れ

```
リクエスト → app.ts → middleware → controllers/ → services/ → repositories/ → entities(DB)
                ↓
            レスポンス
```

### 各レイヤーの役割

1. **app.ts**: Expressアプリケーションの設定、ミドルウェアの適用、ルーティング定義
2. **middleware**: 認証、エラーハンドリング、リクエスト処理時間の計測など
3. **controllers/**: HTTPリクエストの受付、パラメータのバリデーション、レスポンス返却
4. **services/**: ビジネスロジック、データ変換、複数リポジトリの調整
5. **repositories/**: データアクセス層（DB操作、エンティティの取得・保存）
6. **dtos/**: データ転送オブジェクト（リクエスト/レスポンスの型定義）
7. **entities/**: TypeORMエンティティ（DBテーブル定義）

## レイヤー別構造

各レイヤーごとにディレクトリを分けて、機能ごとのファイルを配置します。

```
controllers/                  # HTTPリクエスト/レスポンス処理
├── employee.controller.ts    # 従業員関連コントローラー
└── auth.controller.ts        # 認証関連コントローラー

services/                     # ビジネスロジック
├── employee.service.ts       # 従業員関連サービス
└── auth.service.ts           # 認証関連サービス

repositories/                 # データアクセス層
├── employee.repository.ts    # 従業員関連リポジトリ
└── auth.repository.ts        # 認証関連リポジトリ

dtos/                         # データ転送オブジェクト
├── employee.dto.ts           # 従業員関連DTO
└── auth.dto.ts               # 認証関連DTO
```

### 各ファイルの役割

- **\*.controller.ts**: HTTPリクエスト/レスポンスの処理、パラメータバリデーション
- **\*.service.ts**: ビジネスロジック、データ変換、複数リポジトリの調整
- **\*.repository.ts**: データアクセス層（DB操作を担当、旧DAO）
- **\*.dto.ts**: データ転送オブジェクトの型定義

---

## 自動生成されるディレクトリ

| ディレクトリ | 説明 |
|-------------|------|
| **dist/** | TypeScript ビルド出力（`npm run build`） |
| **node_modules/** | npm パッケージ |
