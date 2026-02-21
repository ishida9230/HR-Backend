import { EmployeeAssignment } from "../entities/EmployeeAssignment";
import { Repository } from "typeorm";

/**
 * 従業員の所属（支店×部署×役職）のシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "employee_assignments" ("id", "employee_id", "department_id", "branch_id", "position_id", "superior_flag", "start_date", "end_date", "created_at") VALUES
 * (1, 1, 1, 1, 1, false, '2020-01-01', NULL, NOW()),  -- 山田太郎: 東京支店 × 営業部 × 平社員
 * (2, 2, 2, 2, 2, true, '2020-02-01', NULL, NOW()),   -- 佐藤花子: 大阪支店 × 開発部 × 主任
 * ... (全10件)
 *
 * employeeId: 従業員ID（employees.tsのidを参照）
 * branchId: 支店ID（branches.tsのidを参照）
 *   1=東京支店, 2=大阪支店, 3=福岡支店
 * departmentId: 部署ID（departments.tsのidを参照）
 *   1=営業部, 2=開発部, 3=CS部, 4=管理部, 5=人事部
 * positionId: 役職ID（positions.tsのidを参照）
 *   1=平社員, 2=主任, 3=部長, 4=社長
 * superiorFlag: 上長フラグ（positionId !== 1 の場合true）
 */
export const employeeAssignmentsData = [
  // 山田太郎（id: 1）: 東京支店 × 営業部 × 平社員
  {
    id: 1,
    employeeId: 1,
    branchId: 1, // 東京支店
    departmentId: 1, // 営業部
    positionId: 1, // 平社員
    superiorFlag: false,
    startDate: "2020-01-01",
    endDate: null,
  },
  // 佐藤花子（id: 2）: 大阪支店 × 開発部 × 主任
  {
    id: 2,
    employeeId: 2,
    branchId: 2, // 大阪支店
    departmentId: 2, // 開発部
    positionId: 2, // 主任
    superiorFlag: true,
    startDate: "2020-02-01",
    endDate: null,
  },
  // 田中一郎（id: 3）: 福岡支店 × CS部 × 平社員
  {
    id: 3,
    employeeId: 3,
    branchId: 3, // 福岡支店
    departmentId: 3, // CS部
    positionId: 1, // 平社員
    superiorFlag: false,
    startDate: "2020-03-01",
    endDate: null,
  },
  // 鈴木次郎（id: 4）: 東京支店 × 管理部 × 部長
  {
    id: 4,
    employeeId: 4,
    branchId: 1, // 東京支店
    departmentId: 4, // 管理部
    positionId: 3, // 部長
    superiorFlag: true,
    startDate: "2020-04-01",
    endDate: null,
  },
  // 渡辺三郎（id: 5）: 大阪支店 × 人事部 × 部長
  {
    id: 5,
    employeeId: 5,
    branchId: 2, // 大阪支店
    departmentId: 5, // 人事部
    positionId: 3, // 部長
    superiorFlag: true,
    startDate: "2020-05-01",
    endDate: null,
  },
  // 小林四郎（id: 6）: 福岡支店 × 営業部 × 平社員
  {
    id: 6,
    employeeId: 6,
    branchId: 3, // 福岡支店
    departmentId: 1, // 営業部
    positionId: 1, // 平社員
    superiorFlag: false,
    startDate: "2020-06-01",
    endDate: null,
  },
  // 加藤五郎（id: 7）: 東京支店 × 開発部 × 平社員
  {
    id: 7,
    employeeId: 7,
    branchId: 1, // 東京支店
    departmentId: 2, // 開発部
    positionId: 1, // 平社員
    superiorFlag: false,
    startDate: "2020-07-01",
    endDate: null,
  },
  // 吉田六郎（id: 8）: 大阪支店 × CS部 × 部長
  {
    id: 8,
    employeeId: 8,
    branchId: 2, // 大阪支店
    departmentId: 3, // CS部
    positionId: 3, // 部長
    superiorFlag: true,
    startDate: "2020-08-01",
    endDate: null,
  },
  // 山本七郎（id: 9）: 福岡支店 × 管理部 × 平社員
  {
    id: 9,
    employeeId: 9,
    branchId: 3, // 福岡支店
    departmentId: 4, // 管理部
    positionId: 1, // 平社員
    superiorFlag: false,
    startDate: "2020-09-01",
    endDate: null,
  },
  // 中村八郎（id: 10）: 東京支店 × 人事部 × 社長
  {
    id: 10,
    employeeId: 10,
    branchId: 1, // 東京支店
    departmentId: 5, // 人事部
    positionId: 4, // 社長
    superiorFlag: true,
    startDate: "2020-10-01",
    endDate: null,
  },
];

/**
 * 従業員所属のシードデータを投入
 *
 * @param repository EmployeeAssignmentリポジトリ
 */
export async function seedEmployeeAssignments(
  repository: Repository<EmployeeAssignment>
): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に従業員所属データが存在します。スキップします。");
    return;
  }

  const assignments = employeeAssignmentsData.map((data) => {
    const assignment = new EmployeeAssignment();
    assignment.id = data.id;
    assignment.employeeId = data.employeeId;
    assignment.departmentId = data.departmentId;
    assignment.branchId = data.branchId;
    assignment.positionId = data.positionId;
    assignment.superiorFlag = data.superiorFlag;
    assignment.startDate = new Date(data.startDate);
    assignment.endDate = data.endDate ? new Date(data.endDate) : null;
    return assignment;
  });

  await repository.save(assignments);
  console.log(`✅ 従業員所属シードデータを投入しました（${assignments.length}件）`);
}
