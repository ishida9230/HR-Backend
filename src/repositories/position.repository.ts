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

/**
 * 役職IDで役職エンティティを取得（データアクセスのみ）
 * @param id 役職ID
 * @returns 役職エンティティ、存在しない場合はnull
 */
export async function getPositionById(id: number): Promise<Position | null> {
  const positionRepository = getPositionRepository();
  return await positionRepository.findOne({
    where: { id },
  });
}
