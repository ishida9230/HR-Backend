/**
 * 部署のDTO定義
 */

/**
 * 部署レスポンスDTO
 */
export interface DepartmentResponse {
  id: number;
  name: string;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}
