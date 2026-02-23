import { Department } from "../entities/Department";
import { Repository } from "typeorm";

/**
 * 部署マスタのシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "departments" ("id", "name", "createdAt", "updatedAt") VALUES
 * (1, '営業部', NOW(), NOW()),
 * (2, '開発部', NOW(), NOW()),
 * (3, 'CS部', NOW(), NOW()),
 * (4, '管理部', NOW(), NOW()),
 * (5, '人事部', NOW(), NOW());
 */
export const departmentsData = [
  {
    id: 1,
    name: "営業部",
  },
  {
    id: 2,
    name: "開発部",
  },
  {
    id: 3,
    name: "CS部",
  },
  {
    id: 4,
    name: "管理部",
  },
  {
    id: 5,
    name: "人事部",
  },
];

/**
 * 部署マスタのシードデータを投入
 *
 * @param repository Departmentリポジトリ
 */
export async function seedDepartments(repository: Repository<Department>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に部署データが存在します。スキップします。");
    return;
  }

  const departments = departmentsData.map((data) => {
    const department = new Department();
    department.id = data.id;
    department.name = data.name;
    return department;
  });

  await repository.save(departments);
  console.log(`✅ 部署シードデータを投入しました（${departments.length}件）`);
}
