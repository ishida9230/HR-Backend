import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Position } from "../entities/Position";

/**
 * 役職リポジトリを取得
 */
function getPositionRepository(): Repository<Position> {
  return AppDataSource.getRepository(Position);
}

/**
 * 全ての役職を取得（データアクセスのみ）
 * @returns 役職エンティティの配列
 */
export async function getAllPositions(): Promise<Position[]> {
  const positionRepository = getPositionRepository();
  return await positionRepository.find({
    order: { id: "ASC" },
  });
}
