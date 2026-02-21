import { DepartmentName } from "../entities/Department";
import { Department } from "../entities/Department";
import { Repository } from "typeorm";

/**
 * 部署マスタのシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "departments" ("id", "name", "createdAt", "updatedAt") VALUES
 * ('<uuid-1>', '営業部', NOW(), NOW()),
 * ('<uuid-2>', '開発部', NOW(), NOW()),
 * ('<uuid-3>', 'CS部', NOW(), NOW()),
 * ('<uuid-4>', '管理部', NOW(), NOW()),
 * ('<uuid-5>', '人事部', NOW(), NOW());
 */
export const departmentsData = [
  {
    id: 1,
    name: DepartmentName.SALES,
  },
  {
    id: 2,
    name: DepartmentName.DEVELOPMENT,
  },
  {
    id: 3,
    name: DepartmentName.CS,
  },
  {
    id: 4,
    name: DepartmentName.ADMINISTRATION,
  },
  {
    id: 5,
    name: DepartmentName.HR,
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
