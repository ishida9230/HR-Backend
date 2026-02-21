import { MigrationInterface, QueryRunner } from "typeorm";

// ENUM型の作成関数をインポート
import {
  getDepartmentNameEnumCreateTypeSQL,
  getDepartmentCreateTableSQL,
} from "../entities/Department";
import { getBranchNameEnumCreateTypeSQL, getBranchCreateTableSQL } from "../entities/Branch";
import { getPositionNameEnumCreateTypeSQL, getPositionCreateTableSQL } from "../entities/Position";
import { getRoleCreateTableSQL } from "../entities/Role";
import {
  getEmploymentTypeEnumCreateTypeSQL,
  getEmployeeCreateTableSQL,
} from "../entities/Employee";
import { getEmployeeAssignmentCreateTableSQL } from "../entities/EmployeeAssignment";
import { getEmployeeRoleCreateTableSQL } from "../entities/EmployeeRole";
import { getRequestStatusEnumCreateTypeSQL, getRequestCreateTableSQL } from "../entities/Request";
import { getRequestItemCreateTableSQL } from "../entities/RequestItem";
import {
  getStepTypeEnumCreateTypeSQL,
  getApprovalStatusEnumCreateTypeSQL,
  getApprovalStepCreateTableSQL,
} from "../entities/ApprovalStep";

export class CreateHRSystemTables1771506549395 implements MigrationInterface {
  name = "CreateHRSystemTables1771506549395";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 注意: このマイグレーションは `npm run migration:run` で実行されます
    // `migration:run` は `drop:tables` を先に実行するため、
    // 全てのテーブルとENUM型が削除された状態で実行されます

    // 1. ENUM型の作成（依存関係なし）
    await queryRunner.query(getDepartmentNameEnumCreateTypeSQL());
    await queryRunner.query(getBranchNameEnumCreateTypeSQL());
    await queryRunner.query(getPositionNameEnumCreateTypeSQL());
    await queryRunner.query(getEmploymentTypeEnumCreateTypeSQL());
    await queryRunner.query(getRequestStatusEnumCreateTypeSQL());
    await queryRunner.query(getStepTypeEnumCreateTypeSQL());
    await queryRunner.query(getApprovalStatusEnumCreateTypeSQL());

    // 2. 依存関係のないテーブルを作成
    await queryRunner.query(getDepartmentCreateTableSQL());
    await queryRunner.query(getBranchCreateTableSQL());
    await queryRunner.query(getPositionCreateTableSQL());
    await queryRunner.query(getRoleCreateTableSQL());

    // 3. employeesテーブルを作成（ENUM型に依存）
    await queryRunner.query(getEmployeeCreateTableSQL());

    // 4. 従業員関連テーブルを作成（employeesに依存、CREATE TABLE内で外部キーを定義）
    await queryRunner.query(getEmployeeAssignmentCreateTableSQL());
    await queryRunner.query(getEmployeeRoleCreateTableSQL());

    // 5. 申請関連テーブルを作成（employees, departments, ENUM型に依存）
    await queryRunner.query(getRequestCreateTableSQL());
    await queryRunner.query(getRequestItemCreateTableSQL());
    await queryRunner.query(getApprovalStepCreateTableSQL());
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // テーブルを削除（依存関係の逆順）
    await queryRunner.query(`DROP TABLE IF EXISTS "approval_steps" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "request_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "requests" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_assignments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employees" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "positions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branches" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE`);

    // ENUM型を削除
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."approval_steps_status_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."approval_steps_step_type_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."requests_status_enum" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."employees_employment_type_enum" CASCADE`
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."position_name_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."branch_name_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."department_name_enum" CASCADE`);
  }
}
