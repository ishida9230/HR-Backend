import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

async function dropAllTables() {
  // drop:tablesスクリプトでは、TypeORMの自動同期を無効化したDataSourceを使用
  // これにより、テーブル削除中にTypeORMが自動的にスキーマを変更しようとするのを防ぐ
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false, // 自動同期を無効化
    logging: false, // ログを無効化（必要に応じて有効化可能）
  });

  try {
    await dataSource.initialize();
    console.log("✅ データベースに接続しました");

    const queryRunner = dataSource.createQueryRunner();

    // 全てのテーブル名を取得（migrationsテーブルは除外）
    const tables = (await queryRunner.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != 'migrations'
    `)) as Array<{ tablename: string }>;

    if (tables.length === 0) {
      console.log("ℹ️ 削除するテーブルがありません");
      await queryRunner.release();
      await dataSource.destroy();
      return;
    }

    if (tables.length > 0) {
      console.log(`\n🗑️  以下のテーブルを削除します（${tables.length}件）:`);
      tables.forEach((table) => {
        console.log(`   - ${table.tablename}`);
      });

      // 外部キー制約を無効化（削除を容易にするため）
      await queryRunner.query(`SET session_replication_role = 'replica';`);

      // 一括でテーブルを削除（処理を簡素化）
      const tableNames = tables.map((table) => `"${table.tablename}"`).join(", ");
      await queryRunner.query(`DROP TABLE IF EXISTS ${tableNames} CASCADE;`);
      console.log(`✅ ${tables.length}件のテーブルを一括削除しました`);
    }

    // カスタム型（ENUM型など）を一括削除
    const customTypes = (await queryRunner.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'e'
        AND typname != 'migrations'
    `)) as Array<{ typname: string }>;

    if (customTypes.length > 0) {
      console.log(`\n🗑️  以下のカスタム型を削除します（${customTypes.length}件）:`);
      customTypes.forEach((type) => {
        console.log(`   - ${type.typname}`);
      });

      // 一括でENUM型を削除（処理を簡素化）
      const typeNames = customTypes.map((type) => `"${type.typname}"`).join(", ");
      await queryRunner.query(`DROP TYPE IF EXISTS ${typeNames} CASCADE;`);
      console.log(`✅ ${customTypes.length}件のカスタム型を一括削除しました`);
    }

    // 外部キー制約を再有効化
    await queryRunner.query(`SET session_replication_role = 'origin';`);

    // migrationsテーブルのレコードを削除（マイグレーション履歴をリセット）
    // migrationsテーブルが存在する場合のみ削除
    const migrationsTableExists = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'migrations'
      )
    `)) as Array<{ exists: boolean }>;

    if (migrationsTableExists[0]?.exists) {
      await queryRunner.query(`DELETE FROM "migrations";`);
      console.log("✅ マイグレーション履歴をリセットしました");
    } else {
      console.log("ℹ️ migrationsテーブルが存在しないため、スキップします");
    }

    await queryRunner.release();
    await dataSource.destroy();

    console.log("\n🎉 全てのテーブルを削除し、マイグレーション履歴をリセットしました");
  } catch (error) {
    console.error("❌ テーブル削除に失敗しました:", error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

void dropAllTables();
