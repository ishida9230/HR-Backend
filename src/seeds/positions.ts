import { PositionName } from "../entities/Position";
import { Position } from "../entities/Position";
import { Repository } from "typeorm";

/**
 * 役職マスタのシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "positions" ("id", "name", "createdAt", "updatedAt") VALUES
 * ('<uuid-1>', '平社員', NOW(), NOW()),
 * ('<uuid-2>', '主任', NOW(), NOW()),
 * ('<uuid-3>', '部長', NOW(), NOW()),
 * ('<uuid-4>', '社長', NOW(), NOW());
 */
export const positionsData = [
  {
    id: 1,
    name: PositionName.REGULAR,
  },
  {
    id: 2,
    name: PositionName.CHIEF,
  },
  {
    id: 3,
    name: PositionName.MANAGER,
  },
  {
    id: 4,
    name: PositionName.PRESIDENT,
  },
];

/**
 * 役職マスタのシードデータを投入
 *
 * @param repository Positionリポジトリ
 */
export async function seedPositions(repository: Repository<Position>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に役職データが存在します。スキップします。");
    return;
  }

  const positions = positionsData.map((data) => {
    const position = new Position();
    position.id = data.id;
    position.name = data.name;
    return position;
  });

  await repository.save(positions);
  console.log(`✅ 役職シードデータを投入しました（${positions.length}件）`);
}
