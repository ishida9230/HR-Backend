import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Department } from "../entities/Department";

/**
 * 部署リポジトリを取得
 */
function getDepartmentRepository(): Repository<Department> {
  return AppDataSource.getRepository(Department);
}

/**
 * 全ての部署を取得（データアクセスのみ）
 * @returns 部署エンティティの配列
 */
export async function getAllDepartments(): Promise<Department[]> {
  const departmentRepository = getDepartmentRepository();
  return await departmentRepository.find({
    order: { id: "ASC" },
  });
}

/**
 * 部署IDで部署エンティティを取得（データアクセスのみ）
 * @param id 部署ID
 * @returns 部署エンティティ、存在しない場合はnull
 */
export async function getDepartmentById(id: number): Promise<Department | null> {
  const departmentRepository = getDepartmentRepository();
  return await departmentRepository.findOne({
    where: { id },
  });
}
