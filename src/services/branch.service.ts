import { Branch } from "../entities/Branch";
import { getAllBranches } from "../repositories/branch.repository";
import { BranchResponse } from "../dtos/branch.dto";

/**
 * BranchエンティティをレスポンスDTOに変換
 */
function mapBranchToResponse(branch: Branch): BranchResponse {
  return {
    id: branch.id,
    name: branch.name,
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString(),
  };
}

/**
 * 全ての支店を取得（ビジネスロジック層）
 * @returns 支店レスポンスの配列
 */
export async function getBranches(): Promise<BranchResponse[]> {
  const branches = await getAllBranches();
  return branches.map(mapBranchToResponse);
}
