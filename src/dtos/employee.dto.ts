/**
 * 雇用タイプの日本語文字列型
 */
export type EmploymentTypeJapanese = "正社員" | "契約社員" | "業務委託";

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
  startDate: string; // ISO 8601形式
  endDate: string | null; // ISO 8601形式
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
