import { Department } from "../entities/Department";
import { getAllDepartments } from "../repositories/department.repository";
import { DepartmentResponse } from "../dtos/department.dto";

/**
 * DepartmentエンティティをレスポンスDTOに変換
 */
function mapDepartmentToResponse(department: Department): DepartmentResponse {
  return {
    id: department.id,
    name: department.name,
    createdAt: department.createdAt.toISOString(),
    updatedAt: department.updatedAt.toISOString(),
  };
}

/**
 * 全ての部署を取得（ビジネスロジック層）
 * @returns 部署レスポンスの配列
 */
export async function getDepartments(): Promise<DepartmentResponse[]> {
  const departments = await getAllDepartments();
  return departments.map(mapDepartmentToResponse);
}
