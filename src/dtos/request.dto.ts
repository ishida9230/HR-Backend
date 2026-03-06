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
 * 所属情報のレスポンスDTO（変更申請詳細ページ用）
 * assignmentsフィールドのoldValue/newValueはこの形式のJSON文字列
 */
export interface AssignmentsFormattedResponse {
  branches: Array<{
    id: number;
    name: string;
  }>;
  departments: Array<{
    id: number;
    name: string;
  }>;
  positions: Array<{
    id: number;
    name: string;
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
  isHidden: boolean;
  items: Array<{
    id: number;
    fieldKey: string;
    oldValue: string | null;
    newValue: string | null;
    // assignmentsフィールドの場合、oldValueとnewValueはAssignmentsFormattedResponseのJSON文字列
    // それ以外のフィールドの場合は通常の文字列
    createdAt: string; // ISO 8601形式
  }>;
}

/**
 * 申請件数レスポンスDTO
 */
export interface RequestCountResponse {
  pendingManager: number;
  pendingHr: number;
}

/**
 * 申請一覧検索クエリDTO
 */
export interface RequestListQuery {
  statuses?: string[];
  employeeName?: string;
  departmentIds?: number[];
  branchIds?: number[];
  positionIds?: number[];
  page?: number;
  limit?: number;
}

/**
 * 申請一覧アイテムDTO
 */
export interface RequestListItem {
  id: number;
  title: string; // textフィールド
  employee: {
    id: number;
    firstName: string;
    lastName: string;
  };
  departments: Array<{
    id: number;
    name: string;
  }>;
  branches: Array<{
    id: number;
    name: string;
  }>;
  positions: Array<{
    id: number;
    name: string;
  }>;
  status: string;
  submittedAt: string | null; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
}

/**
 * 申請一覧レスポンスDTO
 */
export interface RequestListResponse {
  requests: RequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
