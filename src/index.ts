import "reflect-metadata";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    // Database connection
    await AppDataSource.initialize();
    console.log("✅ データベースに接続しました");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
      console.log(`📚 ヘルスチェック: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ サーバーの起動に失敗しました:", error);
    process.exit(1);
  }
}

bootstrap();
