/**
 * 支店のDTO定義
 */

/**
 * 支店レスポンスDTO
 */
export interface BranchResponse {
  id: number;
  name: string;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}
