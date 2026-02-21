import { EmployeeRole } from "../entities/EmployeeRole";
import { Repository } from "typeorm";

/**
 * 従業員の権限ロールのシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "employee_roles" ("id", "employee_id", "role_id", "created_at") VALUES
 * (1, 1, 6, NOW()),  -- 山田太郎: 平社員権限
 * (2, 2, 5, NOW()),  -- 佐藤花子: 主任権限
 * (3, 3, 6, NOW()),  -- 田中一郎: 平社員権限
 * ... (全10件)
 *
 * employeeId: 従業員ID（employees.tsのidを参照）
 * roleId: 権限ロールID（roles.tsのidを参照）
 *
 * 権限ロールID:
 * 1=ADMIN（管理者権限）
 * 2=HR（人事権限）
 * 3=SUPERIOR（上長権限）
 * 4=MANAGER（部長権限）
 * 5=CHIEF（主任権限）
 * 6=EMPLOYEE（平社員権限）
 */
export const employeeRolesData = [
  // 山田太郎（id: 1）: 平社員権限
  {
    id: 1,
    employeeId: 1,
    roleId: 6, // EMPLOYEE
  },
  // 佐藤花子（id: 2）: 主任権限
  {
    id: 2,
    employeeId: 2,
    roleId: 5, // CHIEF
  },
  // 田中一郎（id: 3）: 平社員権限
  {
    id: 3,
    employeeId: 3,
    roleId: 6, // EMPLOYEE
  },
  // 鈴木次郎（id: 4）: 部長権限
  {
    id: 4,
    employeeId: 4,
    roleId: 4, // MANAGER
  },
  // 渡辺三郎（id: 5）: 人事権限
  {
    id: 5,
    employeeId: 5,
    roleId: 2, // HR
  },
  // 小林四郎（id: 6）: 平社員権限
  {
    id: 6,
    employeeId: 6,
    roleId: 6, // EMPLOYEE
  },
  // 加藤五郎（id: 7）: 平社員権限
  {
    id: 7,
    employeeId: 7,
    roleId: 6, // EMPLOYEE
  },
  // 吉田六郎（id: 8）: 上長権限
  {
    id: 8,
    employeeId: 8,
    roleId: 3, // SUPERIOR
  },
  // 山本七郎（id: 9）: 平社員権限
  {
    id: 9,
    employeeId: 9,
    roleId: 6, // EMPLOYEE
  },
  // 中村八郎（id: 10）: 管理者権限
  {
    id: 10,
    employeeId: 10,
    roleId: 1, // ADMIN
  },
];

/**
 * 従業員権限ロールのシードデータを投入
 *
 * @param repository EmployeeRoleリポジトリ
 */
export async function seedEmployeeRoles(repository: Repository<EmployeeRole>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に従業員権限ロールデータが存在します。スキップします。");
    return;
  }

  const employeeRoles = employeeRolesData.map((data) => {
    const employeeRole = new EmployeeRole();
    employeeRole.id = data.id;
    employeeRole.employeeId = data.employeeId;
    employeeRole.roleId = data.roleId;
    return employeeRole;
  });

  await repository.save(employeeRoles);
  console.log(`✅ 従業員権限ロールシードデータを投入しました（${employeeRoles.length}件）`);
}
