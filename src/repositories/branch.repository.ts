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

/**
 * 支店IDで支店エンティティを取得（データアクセスのみ）
 * @param id 支店ID
 * @returns 支店エンティティ、存在しない場合はnull
 */
export async function getBranchById(id: number): Promise<Branch | null> {
  const branchRepository = getBranchRepository();
  return await branchRepository.findOne({
    where: { id },
  });
}
