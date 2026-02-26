import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Branch } from "../entities/Branch";

/**
 * 支店リポジトリを取得
 */
function getBranchRepository(): Repository<Branch> {
  return AppDataSource.getRepository(Branch);
}

/**
 * 全ての支店を取得（データアクセスのみ）
 * @returns 支店エンティティの配列
 */
export async function getAllBranches(): Promise<Branch[]> {
  const branchRepository = getBranchRepository();
  return await branchRepository.find({
    order: { id: "ASC" },
  });
}
