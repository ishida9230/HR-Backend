import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config();

import { AppDataSource } from "../config/database";
import { Department } from "../entities/Department";
import { Branch } from "../entities/Branch";
import { Position } from "../entities/Position";
import { Role } from "../entities/Role";
import { Employee } from "../entities/Employee";
import { EmployeeAssignment } from "../entities/EmployeeAssignment";
import { EmployeeRole } from "../entities/EmployeeRole";
import { Request } from "../entities/Request";
import { RequestItem } from "../entities/RequestItem";

// シード関数のインポート
import { seedDepartments } from "./departments";
import { seedBranches } from "./branches";
import { seedPositions } from "./positions";
import { seedRoles } from "./roles";
import { seedEmployees } from "./employees";
import { seedEmployeeAssignments } from "./employeeAssignments";
import { seedEmployeeRoles } from "./employeeRoles";
import { seedRequests } from "./requests";
import { seedRequestItems } from "./requestItems";

export async function seed() {
  try {
    await AppDataSource.initialize();
    console.log("✅ データベースに接続しました");

    // トランザクション内でシード処理を実行
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      console.log("🔄 トランザクションを開始しました");

      // マスタテーブルのシード（依存関係なし）
      await seedDepartments(transactionalEntityManager.getRepository(Department));
      await seedBranches(transactionalEntityManager.getRepository(Branch));
      await seedPositions(transactionalEntityManager.getRepository(Position));
      await seedRoles(transactionalEntityManager.getRepository(Role));

      // 従業員のシード
      await seedEmployees(transactionalEntityManager.getRepository(Employee));

      // 従業員関連のシード（従業員に依存）
      await seedEmployeeAssignments(transactionalEntityManager.getRepository(EmployeeAssignment));
      await seedEmployeeRoles(transactionalEntityManager.getRepository(EmployeeRole));

      // 申請関連のシード（従業員・部署に依存）
      await seedRequests(transactionalEntityManager.getRepository(Request));
      await seedRequestItems(transactionalEntityManager.getRepository(RequestItem));

      console.log("✅ トランザクションをコミットしました");
    });

    console.log("🎉 シード完了");
  } catch (error) {
    // エラーが発生した場合は自動的にロールバックされる
    console.error("❌ シードに失敗しました:", error);
    console.log("🔄 トランザクションをロールバックしました（自動）");
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// 直接実行された場合（npm run seed）
// tsxで直接実行される場合、process.argv[1]にファイルパスが含まれる
const isDirectExecution =
  process.argv[1]?.includes("seed.ts") || process.argv[1]?.includes("seed.js");

if (isDirectExecution) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
