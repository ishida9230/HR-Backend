/**
 * 役職のDTO定義
 */

/**
 * 役職レスポンスDTO
 */
export interface PositionResponse {
  id: number;
  name: string;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}
