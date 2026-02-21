import { Role } from "../entities/Role";
import { Repository } from "typeorm";

/**
 * 権限ロールマスタのシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "roles" ("id", "name", "permissions", "createdAt", "updatedAt") VALUES
 * ('<uuid-1>', '管理者権限', ARRAY['all'], NOW(), NOW()),
 * ('<uuid-2>', '人事権限', ARRAY[]::text[], NOW(), NOW()),
 * ('<uuid-3>', '上長権限', ARRAY[]::text[], NOW(), NOW()),
 * ('<uuid-4>', '部長権限', ARRAY[]::text[], NOW(), NOW()),
 * ('<uuid-5>', '主任権限', ARRAY[]::text[], NOW(), NOW()),
 * ('<uuid-6>', '平社員権限', ARRAY[]::text[], NOW(), NOW());
 */
export const rolesData = [
  {
    id: 1,
    name: "管理者権限",
    permissions: ["all"],
  },
  {
    id: 2,
    name: "人事権限",
    permissions: [],
  },
  {
    id: 3,
    name: "上長権限",
    permissions: [],
  },
  {
    id: 4,
    name: "部長権限",
    permissions: [],
  },
  {
    id: 5,
    name: "主任権限",
    permissions: [],
  },
  {
    id: 6,
    name: "平社員権限",
    permissions: [],
  },
];

/**
 * 権限ロールマスタのシードデータを投入
 *
 * @param repository Roleリポジトリ
 */
export async function seedRoles(repository: Repository<Role>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に権限ロールデータが存在します。スキップします。");
    return;
  }

  const roles = rolesData.map((data) => {
    const role = new Role();
    role.id = data.id;
    role.name = data.name;
    role.permissions = data.permissions;
    return role;
  });

  await repository.save(roles);
  console.log(`✅ 権限ロールシードデータを投入しました（${roles.length}件）`);
}
