/**
 * 変更申請のDTO定義
 */

/**
 * 変更申請作成リクエストDTO
 */
export interface CreateRequestRequest {
  employeeId: number;
  text: string;
  items: Array<{
    fieldKey: string;
    oldValue: string | null;
    newValue: string | null;
  }>;
}

/**
 * 変更申請レスポンスDTO
 */
export interface RequestResponse {
  id: number;
  employeeId: number;
  status: string;
  text: string;
  submittedAt: string | null; // ISO 8601形式
  completedAt: string | null; // ISO 8601形式
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  items: Array<{
    id: number;
    fieldKey: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: string; // ISO 8601形式
  }>;
}
