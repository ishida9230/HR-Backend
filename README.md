# HRシステム バックエンド

## セットアップ

```bash
# 依存パッケージのインストール
npm install
```

## 環境変数

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
PORT=
```

## データベースセットアップ

### マイグレーション実行

```bash
# テーブル削除 → マイグレーション実行
npm run migration:run

# マイグレーションのみ実行（テーブル削除なし）
npm run migration:run:raw
```

### シードデータ投入

```bash
# シードデータを投入
npm run seed

# マイグレーション + シードデータ投入（一括実行）
npm run db:setup
```

## サーバー起動

```bash
# 開発モード（ホットリロード）
npm run dev

# 本番モード
npm run build
npm start
```

## コード品質チェック

### リント

```bash
# リントチェック
npm run lint

# リント自動修正
npm run lint:fix
```

### フォーマット

```bash
# フォーマット適用
npm run format

# フォーマットチェック
npm run format:check
```

### 一括チェック

```bash
# リントとフォーマットの両方をチェック
npm run check
```

## 主要コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | TypeScriptコンパイル |
| `npm start` | 本番サーバー起動 |
| `npm run migration:run` | マイグレーション実行（テーブル削除含む） |
| `npm run seed` | シードデータ投入 |
| `npm run db:setup` | マイグレーション + シードデータ投入 |
| `npm run lint` | リントチェック |
| `npm run lint:fix` | リント自動修正 |
| `npm run format` | フォーマット適用 |
| `npm run format:check` | フォーマットチェック |
| `npm run check` | リント + フォーマットチェック |
