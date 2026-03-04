import { Employee } from "../entities/Employee";
import { mapEmploymentTypeToJapanese } from "../utils/formatter";
import { getEmployeeById } from "../repositories/employee.repository";
import { EmployeeProfileResponse, ChangeRequestInfo } from "../dtos/employee.dto";
import { getVisibleRequestsByEmployeeId } from "../repositories/request.repository";
import { Request, RequestStatus } from "../entities/Request";

/**
 * EmployeeエンティティをレスポンスDTOに変換
 * @param employee 従業員エンティティ
 * @param visibleRequests 非表示でない変更申請の配列（ソート済み）
 */
function mapEmployeeToResponse(
  employee: Employee,
  visibleRequests: Request[] = []
): EmployeeProfileResponse {
  // ビジネスロジック: 全ての所属情報を取得
  // 注意: SQLでid順にソート済み（repositories/employee.repository.ts参照）
  const activeAssignments = employee.assignments;

  // 承認待ちの申請があるかチェック（完了、差し戻し以外）
  const pendingRequest = visibleRequests.find(
    (req) => req.status === RequestStatus.PENDING_MANAGER || req.status === RequestStatus.PENDING_HR
  );
  const hasPendingChangeRequest = pendingRequest !== undefined;

  // 非表示でない変更申請を全て取得（isHidden: false）
  const changeRequests: ChangeRequestInfo[] = visibleRequests.map((req) => ({
    id: req.id,
    status: req.status,
    isHidden: req.isHidden,
  }));

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
    changeRequests,
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

  // リポジトリ層で非表示でない変更申請を全て取得
  const visibleRequests = await getVisibleRequestsByEmployeeId(id);

  // ビジネスロジック: データ変換（エンティティ → DTO）
  return mapEmployeeToResponse(employee, visibleRequests);
}
