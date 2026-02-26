import { Position } from "../entities/Position";
import { getAllPositions } from "../repositories/position.repository";
import { PositionResponse } from "../dtos/position.dto";

/**
 * PositionエンティティをレスポンスDTOに変換
 */
function mapPositionToResponse(position: Position): PositionResponse {
  return {
    id: position.id,
    name: position.name,
    createdAt: position.createdAt.toISOString(),
    updatedAt: position.updatedAt.toISOString(),
  };
}

/**
 * 全ての役職を取得（ビジネスロジック層）
 * @returns 役職レスポンスの配列
 */
export async function getPositions(): Promise<PositionResponse[]> {
  const positions = await getAllPositions();
  return positions.map(mapPositionToResponse);
}
