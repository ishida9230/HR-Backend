import { BranchName } from "../entities/Branch";
import { Branch } from "../entities/Branch";
import { Repository } from "typeorm";

/**
 * 支店マスタのシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "branches" ("id", "name", "createdAt", "updatedAt") VALUES
 * ('<uuid-1>', '東京支店', NOW(), NOW()),
 * ('<uuid-2>', '大阪支店', NOW(), NOW()),
 * ('<uuid-3>', '福岡支店', NOW(), NOW());
 */
export const branchesData = [
  {
    id: 1,
    name: BranchName.TOKYO,
  },
  {
    id: 2,
    name: BranchName.OSAKA,
  },
  {
    id: 3,
    name: BranchName.FUKUOKA,
  },
];

/**
 * 支店マスタのシードデータを投入
 *
 * @param repository Branchリポジトリ
 */
export async function seedBranches(repository: Repository<Branch>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に支店データが存在します。スキップします。");
    return;
  }

  const branches = branchesData.map((data) => {
    const branch = new Branch();
    branch.id = data.id;
    branch.name = data.name;
    return branch;
  });

  await repository.save(branches);
  console.log(`✅ 支店シードデータを投入しました（${branches.length}件）`);
}
