/**
 * 雇用タイプの日本語文字列型
 */
export type EmploymentTypeJapanese = "正社員" | "契約社員" | "業務委託";

/**
 * 変更申請情報（簡易版）
 */
export interface ChangeRequestInfo {
  id: number;
  status: string; // RequestStatusの文字列値
  isHidden: boolean;
}

/**
 * 従業員プロフィールのレスポンスDTO
 */
export interface EmployeeProfileResponse {
  id: number;
  employeeCode: number;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  address: string;
  phone: string;
  employmentType: EmploymentTypeJapanese;
  isActive: boolean;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  assignments: EmployeeAssignmentResponse[];
  hasPendingChangeRequest: boolean; // 完了、差し戻し以外のステータスがあるかどうか
  changeRequests: ChangeRequestInfo[]; // 非表示でない変更申請の全て（isHidden: false、ソート済み）
}

/**
 * 従業員所属情報のレスポンスDTO
 */
export interface EmployeeAssignmentResponse {
  id: number;
  employeeId: number;
  departmentId: number;
  branchId: number;
  positionId: number;
  superiorFlag: boolean;
  createdAt: string; // ISO 8601形式
  department: {
    id: number;
    name: string;
  };
  branch: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
  };
}
