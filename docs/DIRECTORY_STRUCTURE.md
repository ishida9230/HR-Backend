# バックエンド ディレクトリ構成

## 全体構成

```
backend/
├── docs/                      # ドキュメント
│   ├── DIRECTORY_STRUCTURE.md # 本ファイル（ディレクトリ構成）
│   └── SEED_IMPLEMENTATION.md # シード実装手順
├── src/                       # ソースコード
│   ├── config/                # 設定
│   ├── controllers/           # コントローラー
│   ├── entities/              # エンティティ（DBテーブル定義）
│   ├── middleware/            # ミドルウェア
│   ├── routes/                # ルート定義
│   ├── seeds/                 # シードスクリプト
│   ├── services/              # ビジネスロジック
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
├── controllers/               # コントローラー（リクエスト処理）
│   └── auth.controller.ts     # 認証関連（ログイン・登録）
│
├── entities/                  # エンティティ（DBテーブル定義）
│   └── User.ts                # ユーザーテーブル
│
├── middleware/                # ミドルウェア
│   └── auth.middleware.ts     # JWT認証ミドルウェア
│
├── routes/                    # APIルート定義
│   └── auth.routes.ts         # 認証APIルート
│
├── migrations/                # マイグレーション
│   └── *-CreateUsersTable.ts  # テーブル作成マイグレーション
│
├── seeds/                     # シードデータ
│   └── seed.ts               # 初期データ投入スクリプト
│
├── services/                  # ビジネスロジック層
│   └── auth.service.ts       # 認証サービス
│
├── utils/                     # ユーティリティ関数
│
├── app.ts                     # Expressアプリケーション設定
└── index.ts                   # エントリーポイント（サーバー起動）
```

---

## 各ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| **config/** | DB接続、環境変数などの設定 |
| **controllers/** | HTTPリクエストの受付、レスポンス返却 |
| **entities/** | TypeORMエンティティ（DBテーブル定義） |
| **middleware/** | 認証、ログ、エラーハンドリングなど |
| **routes/** | APIエンドポイントのルーティング定義 |
| **seeds/** | 初期データ投入スクリプト |
| **services/** | ビジネスロジック、DB操作 |
| **utils/** | 共通ユーティリティ関数 |

---

## リクエストの流れ

```
リクエスト → routes → middleware → controllers → services → entities(DB)
                ↓
            レスポンス
```

---

## 自動生成されるディレクトリ

| ディレクトリ | 説明 |
|-------------|------|
| **dist/** | TypeScript ビルド出力（`npm run build`） |
| **node_modules/** | npm パッケージ |
