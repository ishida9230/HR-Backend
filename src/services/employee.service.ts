import { Employee } from "../entities/Employee";
import { mapEmploymentTypeToJapanese } from "../utils/formatter";
import { getEmployeeById } from "../repositories/employee.repository";
import { EmployeeProfileResponse } from "../dtos/employee.dto";
import { getLatestRequestByEmployeeId } from "../repositories/request.repository";
import { RequestItem } from "../entities/RequestItem";

/**
 * EmployeeエンティティをレスポンスDTOに変換
 * @param employee 従業員エンティティ
 * @param latestRequest 最新の変更申請（オプション）
 */
function mapEmployeeToResponse(
  employee: Employee,
  latestRequest: { id: number; items: RequestItem[] } | null = null
): EmployeeProfileResponse {
  // ビジネスロジック: end_dateがnullの所属情報のみフィルタリング
  // 注意: SQLでid順にソート済み（repositories/employee.repository.ts参照）
  const activeAssignments = employee.assignments.filter(
    (assignment) => assignment.endDate === null
  );

  // 変更申請があるかどうかのフラグ（変更項目がある場合のみtrue）
  const hasPendingChangeRequest =
    latestRequest !== null && latestRequest.items.length > 0;

  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    email: employee.email,
    firstName: employee.firstName,
    lastName: employee.lastName,
    postalCode: employee.postalCode,
    address: employee.address,
    phone: employee.phone,
    employmentType: mapEmploymentTypeToJapanese(employee.employmentType),
    isActive: employee.isActive,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
    assignments: activeAssignments.map((assignment) => ({
      id: assignment.id,
      employeeId: assignment.employeeId,
      departmentId: assignment.departmentId,
      branchId: assignment.branchId,
      positionId: assignment.positionId,
      superiorFlag: assignment.superiorFlag,
      startDate: assignment.startDate.toISOString(),
      endDate: assignment.endDate ? assignment.endDate.toISOString() : null,
      createdAt: assignment.createdAt.toISOString(),
      department: {
        id: assignment.department.id,
        name: assignment.department.name,
      },
      branch: {
        id: assignment.branch.id,
        name: assignment.branch.name,
      },
      position: {
        id: assignment.position.id,
        name: assignment.position.name,
      },
    })),
    hasPendingChangeRequest,
    latestChangeRequestId: latestRequest?.id ?? null,
  };
}

/**
 * 従業員IDでプロフィールを取得（ビジネスロジック層）
 * @param id 従業員ID（正の整数であることが前提）
 * @returns 従業員プロフィール
 * @throws RecordNotFoundException 従業員が見つからない場合
 */
export async function getEmployeeProfile(id: number): Promise<EmployeeProfileResponse> {
  // リポジトリ層で従業員エンティティを取得（is_active = trueでフィルタリング済み）
  const employee = await getEmployeeById(id);

  // リポジトリ層で最新の変更申請を取得
  const latestRequest = await getLatestRequestByEmployeeId(id);

  // ビジネスロジック: データ変換（エンティティ → DTO）
  return mapEmployeeToResponse(employee, latestRequest);
}
