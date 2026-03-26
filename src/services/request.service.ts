import { Request } from "../entities/Request";
import {
  saveRequest,
  saveRequestItems,
  getRequestById,
  hasPendingRequestByEmployeeId,
  getRequestByIdWithoutRelations,
  updateRequestIsHidden,
  getRequestCounts,
  getRequestList,
} from "../repositories/request.repository";
import {
  getPreviousApprovalStep,
  saveApprovalStep,
  getApprovalStepByRequestIdAndStepType,
} from "../repositories/approval-step.repository";
import { StepType, ApprovalStatus } from "../entities/ApprovalStep";
import {
  CreateRequestRequest,
  RequestResponse,
  RequestCountResponse,
  RequestListQuery,
  RequestListResponse,
  RequestListItem,
  ApproveRequestRequest,
  RequestApprovalResponse,
  PreviousApprovalInfo,
  RequestActionRequest,
} from "../dtos/request.dto";
import { getEmployeeById } from "../repositories/employee.repository";
import { Employee } from "../entities/Employee";
import { RequestItem } from "../entities/RequestItem";
import { EmployeeAssignment } from "../entities/EmployeeAssignment";
import { EntityManager } from "typeorm";
import { getBranchById } from "../repositories/branch.repository";
import { getDepartmentById } from "../repositories/department.repository";
import { getPositionById } from "../repositories/position.repository";
import HttpException from "../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_REQUEST_CREATION_FAILED,
  ERROR_MESSAGE_REQUEST_CREATION_ERROR,
  ERROR_MESSAGE_REQUEST_NOT_FOUND,
  ERROR_MESSAGE_INVALID_BRANCH_ID,
  ERROR_MESSAGE_INVALID_DEPARTMENT_ID,
  ERROR_MESSAGE_INVALID_POSITION_ID,
  ERROR_MESSAGE_DATA_FETCH_ERROR,
  ERROR_MESSAGE_PENDING_REQUEST_EXISTS,
  ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN,
  ERROR_MESSAGE_REQUEST_NOT_PROCESSABLE,
  ERROR_MESSAGE_STATUS_MISMATCH,
  ERROR_MESSAGE_EMPLOYEE_NOT_FOUND,
  ERROR_MESSAGE_INVALID_STATUS,
  ERROR_MESSAGE_ASSIGNMENTS_MUST_BE_ARRAY,
  ERROR_MESSAGE_ASSIGNMENTS_UPDATE_FAILED,
} from "../constants/error-messages";
import { RequestStatus } from "../entities/Request";
import { AppDataSource } from "../config/database";

/**
 * 所属情報のJSON文字列をパースして、IDから名前を取得した形式に変換
 * @param value アサインメント配列のJSON文字列またはnull
 * @returns {branches: [{id, name}], departments: [{id, name}], positions: [{id, name}]}のJSON文字列、またはnull
 * @throws HttpException マスターデータが存在しない場合（DB整合性違反）
 */
export async function formatAssignmentsValue(value: string | null): Promise<string | null> {
  if (!value) {
    return value;
  }

  try {
    const assignments = JSON.parse(value) as Array<{
      branchId: number;
      departmentId: number;
      positionId: number;
    }>;
    if (!Array.isArray(assignments)) {
      return value;
    }

    // 元の配列の順序を保持するため、出現順序を記録
    // 重複チェックは行わず、すべてのマスターデータを含める
    const branchList: Array<{ id: number; name: string; order: number }> = [];
    const departmentList: Array<{ id: number; name: string; order: number }> = [];
    const positionList: Array<{ id: number; name: string; order: number }> = [];

    // 重複を避けるためのMap（マスターデータ取得の最適化用）
    const branchCache = new Map<number, { id: number; name: string }>();
    const departmentCache = new Map<number, { id: number; name: string }>();
    const positionCache = new Map<number, { id: number; name: string }>();

    // 各アサインメントからマスターデータを取得（順次処理で順序を保証）
    for (let index = 0; index < assignments.length; index++) {
      const a = assignments[index];
      const branchId = Number(a.branchId);
      const departmentId = Number(a.departmentId);
      const positionId = Number(a.positionId);

      // キャッシュから取得、なければDBから取得
      let branch = branchCache.get(branchId);
      let department = departmentCache.get(departmentId);
      let position = positionCache.get(positionId);

      if (!branch) {
        const fetchedBranch = await getBranchById(branchId);
        if (!fetchedBranch) {
          throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_BRANCH_ID, {
            branchId,
          });
        }
        branch = { id: fetchedBranch.id, name: fetchedBranch.name };
        branchCache.set(branchId, branch);
      }

      if (!department) {
        const fetchedDepartment = await getDepartmentById(departmentId);
        if (!fetchedDepartment) {
          throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_DEPARTMENT_ID, {
            departmentId,
          });
        }
        department = { id: fetchedDepartment.id, name: fetchedDepartment.name };
        departmentCache.set(departmentId, department);
      }

      if (!position) {
        const fetchedPosition = await getPositionById(positionId);
        if (!fetchedPosition) {
          throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_POSITION_ID, {
            positionId,
          });
        }
        position = { id: fetchedPosition.id, name: fetchedPosition.name };
        positionCache.set(positionId, position);
      }

      // リストに追加（重複チェックなし、すべて追加）
      branchList.push({ id: branch.id, name: branch.name, order: index });
      departmentList.push({ id: department.id, name: department.name, order: index });
      positionList.push({ id: position.id, name: position.name, order: index });
    }

    // 元の配列での出現順序でソート
    const branches = branchList.sort((a, b) => a.order - b.order);
    const departments = departmentList.sort((a, b) => a.order - b.order);
    const positions = positionList.sort((a, b) => a.order - b.order);

    // orderプロパティを削除して返す
    const branchesFormatted = branches.map(({ order: _order, ...rest }) => rest);
    const departmentsFormatted = departments.map(({ order: _order, ...rest }) => rest);
    const positionsFormatted = positions.map(({ order: _order, ...rest }) => rest);

    return JSON.stringify({
      branches: branchesFormatted,
      departments: departmentsFormatted,
      positions: positionsFormatted,
    });
  } catch (error) {
    // HttpExceptionの場合はそのまま再スロー
    if (error instanceof HttpException) {
      throw error;
    }
    // JSONパースに失敗した場合やその他のエラーはデータ不整合として扱う
    throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGE_DATA_FETCH_ERROR, {
      originalError: error instanceof Error ? error.message : String(error),
      value,
    });
  }
}

/**
 * RequestエンティティをレスポンスDTOに変換
 */
async function mapRequestToResponse(request: Request): Promise<RequestResponse> {
  // itemsを非同期で処理（assignmentsフィールドの場合にIDから名前を取得）
  const items = await Promise.all(
    request.items.map(async (item) => {
      let oldValue = item.oldValue;
      let newValue = item.newValue;

      // assignmentsフィールドの場合、IDから名前を取得
      if (item.fieldKey === "assignments") {
        oldValue = await formatAssignmentsValue(item.oldValue);
        newValue = await formatAssignmentsValue(item.newValue);
      }

      return {
        id: item.id,
        fieldKey: item.fieldKey,
        oldValue,
        newValue,
        createdAt: item.createdAt.toISOString(),
      };
    })
  );

  return {
    id: request.id,
    employeeId: request.employeeId,
    status: request.status,
    text: request.text,
    submittedAt: request.submittedAt ? request.submittedAt.toISOString() : null,
    completedAt: request.completedAt ? request.completedAt.toISOString() : null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    isHidden: request.isHidden,
    items,
  };
}

/**
 * 変更申請を作成（ビジネスロジック層）
 * @param requestData 変更申請リクエストデータ
 * @returns 作成された変更申請レスポンス
 * @throws HttpException 従業員が見つからない場合 (404) またはデータ変換エラー (500)
 */
export async function createChangeRequest(
  requestData: CreateRequestRequest
): Promise<RequestResponse> {
  try {
    // ビジネスロジック: 申請者の存在確認（getEmployeeById内で既にチェック済み）
    await getEmployeeById(requestData.employeeId);

    // ビジネスロジック: 承認待ちの変更申請が既に存在するかチェック
    const hasPending = await hasPendingRequestByEmployeeId(requestData.employeeId);
    if (hasPending) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_PENDING_REQUEST_EXISTS);
    }

    // ビジネスロジック: トランザクション内で変更申請とアイテムを作成
    const request = await AppDataSource.transaction(async (transactionalEntityManager) => {
      // リポジトリ層で変更申請を作成
      const savedRequest = await saveRequest(
        {
          employeeId: requestData.employeeId,
          text: requestData.text,
          status: RequestStatus.PENDING_MANAGER,
          submittedAt: new Date(),
        },
        transactionalEntityManager
      );

      // リポジトリ層で変更申請アイテムを作成
      await saveRequestItems(
        requestData.items.map((item) => ({
          requestId: savedRequest.id,
          fieldKey: item.fieldKey,
          oldValue: item.oldValue,
          newValue: item.newValue,
        })),
        transactionalEntityManager
      );

      // リポジトリ層でリレーションを含めて取得
      const requestWithItems = await getRequestById(savedRequest.id, transactionalEntityManager);

      if (!requestWithItems) {
        throw new Error(ERROR_MESSAGE_REQUEST_CREATION_FAILED);
      }

      return requestWithItems;
    });

    // ビジネスロジック: データ変換（エンティティ → DTO）
    return await mapRequestToResponse(request);
  } catch (error) {
    if (error instanceof HttpException) {
      throw error; // 既にHttpExceptionの場合はそのまま再スロー
    }
    // その他の予期しないエラー（例: データ変換エラー、TypeORMエラーなど）
    throw new HttpException(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGE_REQUEST_CREATION_ERROR,
      {
        originalError: error instanceof Error ? error.message : String(error),
      }
    );
  }
}

/**
 * 変更申請をIDで取得（ビジネスロジック層）
 * @param id 変更申請ID
 * @returns 変更申請レスポンス
 * @throws HttpException 変更申請が見つからない場合 (404)
 */
export async function getChangeRequestById(id: number): Promise<RequestResponse> {
  const request = await getRequestById(id);

  if (!request) {
    throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND, {
      requestId: id,
    });
  }

  return await mapRequestToResponse(request);
}

/**
 * 変更申請を非表示にする（ビジネスロジック層）
 * @param id 変更申請ID
 * @returns 更新された変更申請ID
 * @throws HttpException 変更申請が見つからない場合 (404) または既に非表示の場合 (400)
 */
export async function hideChangeRequest(id: number): Promise<{ id: number }> {
  // 1. 存在確認（リポジトリ層で取得）
  const request = await getRequestByIdWithoutRelations(id);

  // 2. 存在チェック（サービス層でエラーハンドリング）
  if (!request) {
    throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND, {
      requestId: id,
    });
  }

  // 3. ビジネスロジックチェック（サービス層）
  if (request.isHidden) {
    throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN, {
      requestId: id,
    });
  }

  // 4. 更新（リポジトリ層でDB操作）
  const updatedRequest = await updateRequestIsHidden(request);

  // レスポンスは更新したrequestIdのみ
  return { id: updatedRequest.id };
}

/**
 * 申請件数をステータス別に取得（ビジネスロジック層）
 * @returns ステータス別の申請件数
 */
export async function getRequestCountsService(): Promise<RequestCountResponse> {
  return await getRequestCounts();
}

/**
 * 申請一覧を取得（ビジネスロジック層）
 * @param query 検索・フィルタリング・ページネーションクエリ
 * @returns 申請一覧とページネーション情報
 */
export async function getRequestListService(query: RequestListQuery): Promise<RequestListResponse> {
  const { statuses, employeeName, departmentIds, branchIds, positionIds, page = 1, limit = 25 } = query;

  // ステータスをRequestStatus enumに変換（複数対応）
  const requestStatuses: RequestStatus[] | undefined = statuses
    ? statuses.map((s) => s as RequestStatus).filter((s) => Object.values(RequestStatus).includes(s))
    : undefined;

  // リポジトリ層で取得
  const { requests, total, page: resultPage, limit: resultLimit, totalPages } = await getRequestList({
    statuses: requestStatuses,
    employeeName,
    departmentIds,
    branchIds,
    positionIds,
    page,
    limit,
  });

  // エンティティをDTOに変換
  const requestListItems: RequestListItem[] = requests.map((request) => {
    // 従業員のすべての所属情報を取得
    const assignments = request.employee.assignments || [];

    // 部署、支店、役職を配列として取得（重複を除去）
    const departmentMap = new Map<number, { id: number; name: string }>();
    const branchMap = new Map<number, { id: number; name: string }>();
    const positionMap = new Map<number, { id: number; name: string }>();

    assignments.forEach((assignment) => {
      if (assignment.department) {
        departmentMap.set(assignment.department.id, {
          id: assignment.department.id,
          name: assignment.department.name,
        });
      }
      if (assignment.branch) {
        branchMap.set(assignment.branch.id, {
          id: assignment.branch.id,
          name: assignment.branch.name,
        });
      }
      if (assignment.position) {
        positionMap.set(assignment.position.id, {
          id: assignment.position.id,
          name: assignment.position.name,
        });
      }
    });

    return {
      id: request.id,
      title: request.text,
      employee: {
        id: request.employee.id,
        firstName: request.employee.firstName,
        lastName: request.employee.lastName,
      },
      departments: Array.from(departmentMap.values()),
      branches: Array.from(branchMap.values()),
      positions: Array.from(positionMap.values()),
      status: request.status,
      submittedAt: request.submittedAt ? request.submittedAt.toISOString() : null,
      updatedAt: request.updatedAt.toISOString(),
    };
  });

  return {
    requests: requestListItems,
    total,
    page: resultPage,
    limit: resultLimit,
    totalPages,
  };
}

/**
 * 申請承認画面用の申請詳細を取得（前回の承認情報を含む）
 * @param id 申請ID
 * @returns 申請詳細と前回の承認情報
 * @throws HttpException 申請が見つからない場合
 */
export async function getRequestForApprovalService(
  id: number
): Promise<RequestApprovalResponse> {
  // 1. 申請を取得
  const request = await getRequestById(id);
  if (!request) {
    throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND);
  }

  // 2. 前回の承認情報を取得
  const previousStep = await getPreviousApprovalStep(id);
  let previousApproval: PreviousApprovalInfo | null = null;

  if (previousStep && previousStep.actedByEmployee) {
    previousApproval = {
      actedAt: previousStep.actedAt ? previousStep.actedAt.toISOString() : null,
      actedBy: {
        id: previousStep.actedByEmployee.id,
        firstName: previousStep.actedByEmployee.firstName,
        lastName: previousStep.actedByEmployee.lastName,
      },
      comment: previousStep.comment || null,
    };
  }

  // 3. RequestResponseに変換
  const requestResponse: RequestResponse = {
    id: request.id,
    employeeId: request.employeeId,
    status: request.status,
    text: request.text,
    submittedAt: request.submittedAt ? request.submittedAt.toISOString() : null,
    completedAt: request.completedAt ? request.completedAt.toISOString() : null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    isHidden: request.isHidden,
    items: request.items.map((item) => ({
      id: item.id,
      fieldKey: item.fieldKey,
      oldValue: item.oldValue,
      newValue: item.newValue,
      createdAt: item.createdAt.toISOString(),
    })),
  };

  return {
    ...requestResponse,
    previousApproval,
  };
}

/**
 * 申請を承認する（ビジネスロジック層）
 * @param id 申請ID
 * @param approveData 承認データ（コメント、承認者ID）
 * @returns 更新された申請レスポンス
 * @throws HttpException 申請が見つからない、または承認できない状態の場合
 */
export async function approveRequestService(
  id: number,
  approveData: ApproveRequestRequest
): Promise<RequestResponse> {
  return await AppDataSource.transaction(async (manager) => {
    // 1. 申請を取得
    const request = await getRequestByIdWithoutRelations(id);
    if (!request) {
      throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND);
    }

    // 2. 承認可能な状態かチェック
    if (request.status !== RequestStatus.PENDING_MANAGER && request.status !== RequestStatus.PENDING_HR) {
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        "この申請は承認可能な状態ではありません。"
      );
    }

    // 3. 現在のステップタイプを決定
    const currentStepType =
      request.status === RequestStatus.PENDING_MANAGER ? StepType.MANAGER : StepType.HR;

    // 4. 承認ステップを作成または更新
    const stepOrder = currentStepType === StepType.MANAGER ? 1 : 2;
    await saveApprovalStep(
      {
        requestId: id,
        stepOrder,
        stepType: currentStepType,
        status: ApprovalStatus.APPROVED,
        actedByEmployeeId: approveData.actedByEmployeeId,
        comment: approveData.comment || null,
        actedAt: new Date(),
      },
      manager
    );

    // 5. 申請のステータスを更新
    const requestRepository = manager.getRepository(Request);
    if (currentStepType === StepType.MANAGER) {
      // 上長承認の場合、人事承認待ちに変更
      request.status = RequestStatus.PENDING_HR;
    } else {
      // 人事承認の場合、完了に変更
      request.status = RequestStatus.COMPLETED;
      request.completedAt = new Date();
    }
    await requestRepository.save(request);

    // 6. 更新された申請を取得して返却
    const updatedRequest = await getRequestById(id);
    if (!updatedRequest) {
      throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND);
    }

    return {
      id: updatedRequest.id,
      employeeId: updatedRequest.employeeId,
      status: updatedRequest.status,
      text: updatedRequest.text,
      submittedAt: updatedRequest.submittedAt ? updatedRequest.submittedAt.toISOString() : null,
      completedAt: updatedRequest.completedAt ? updatedRequest.completedAt.toISOString() : null,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
      isHidden: updatedRequest.isHidden,
      items: updatedRequest.items.map((item) => ({
        id: item.id,
        fieldKey: item.fieldKey,
        oldValue: item.oldValue,
        newValue: item.newValue,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  });
}

/**
 * 申請を差し戻す（ビジネスロジック層）
 * @param id 申請ID
 * @param rejectData 差し戻しデータ（コメント、差し戻し者ID）
 * @returns 更新された申請レスポンス
 * @throws HttpException 申請が見つからない、または差し戻しできない状態の場合
 */
export async function rejectRequestService(
  id: number,
  rejectData: ApproveRequestRequest
): Promise<RequestResponse> {
  return await AppDataSource.transaction(async (manager) => {
    // 1. 申請を取得
    const requestRepository = manager.getRepository(Request);
    const request = await requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND);
    }

    // 2. 差し戻し可能な状態かチェック
    if (request.status !== RequestStatus.PENDING_MANAGER && request.status !== RequestStatus.PENDING_HR) {
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        "この申請は差し戻し可能な状態ではありません。"
      );
    }

    // 3. 現在のステップタイプを決定
    const currentStepType =
      request.status === RequestStatus.PENDING_MANAGER ? StepType.MANAGER : StepType.HR;

    // 4. 差し戻しステップを作成または更新
    const stepOrder = currentStepType === StepType.MANAGER ? 1 : 2;
    await saveApprovalStep(
      {
        requestId: id,
        stepOrder,
        stepType: currentStepType,
        status: ApprovalStatus.CHANGES_REQUESTED,
        actedByEmployeeId: rejectData.actedByEmployeeId,
        comment: rejectData.comment || null,
        actedAt: new Date(),
      },
      manager
    );

    // 5. 申請のステータスを差し戻しに変更
    request.status = RequestStatus.CHANGES_REQUESTED;
    await requestRepository.save(request);

    // 6. 更新された申請を取得して返却
    const updatedRequest = await getRequestById(id);
    if (!updatedRequest) {
      throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND);
    }

    return {
      id: updatedRequest.id,
      employeeId: updatedRequest.employeeId,
      status: updatedRequest.status,
      text: updatedRequest.text,
      submittedAt: updatedRequest.submittedAt ? updatedRequest.submittedAt.toISOString() : null,
      completedAt: updatedRequest.completedAt ? updatedRequest.completedAt.toISOString() : null,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
      isHidden: updatedRequest.isHidden,
      items: updatedRequest.items.map((item) => ({
        id: item.id,
        fieldKey: item.fieldKey,
        oldValue: item.oldValue,
        newValue: item.newValue,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  });
}

/**
 * 申請の承認・差し戻しを処理（統合API用）
 * @param id 申請ID
 * @param actionData アクションデータ（status, comment, actedByEmployeeId）
 * @returns 更新された申請レスポンス
 * @throws HttpException 申請が見つからない、または処理できない状態の場合、またはstatusが一致しない場合
 */
export async function processRequestActionService(
  id: number,
  actionData: RequestActionRequest
): Promise<RequestResponse> {
  return await AppDataSource.transaction(async (manager) => {
    // 1. 申請を取得
    const requestRepository = manager.getRepository(Request);
    const request = await requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND);
    }

    // 2. 処理可能な状態かチェック
    if (request.status !== RequestStatus.PENDING_MANAGER && request.status !== RequestStatus.PENDING_HR) {
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE_REQUEST_NOT_PROCESSABLE
      );
    }

    // 3. 送られてきたstatusをRequestStatus enumに変換
    const nextStatus = actionData.status as RequestStatus;
    const isReject = nextStatus === RequestStatus.CHANGES_REQUESTED;

    // 4. 送られてきたstatusが有効か確認
    if (!Object.values(RequestStatus).includes(nextStatus)) {
      const errorMessage = ERROR_MESSAGE_INVALID_STATUS.replace("{status}", nextStatus);
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        errorMessage,
        {
          receivedStatus: nextStatus,
        }
      );
    }

    // 5. 期待される次のstatusを計算
    let expectedNextStatus: RequestStatus;
    if (isReject) {
      // 差し戻しの場合
      expectedNextStatus = RequestStatus.CHANGES_REQUESTED;
    } else {
      // 承認の場合
      if (request.status === RequestStatus.PENDING_MANAGER) {
        expectedNextStatus = RequestStatus.PENDING_HR;
      } else {
        expectedNextStatus = RequestStatus.COMPLETED;
      }
    }

    // 6. 送られてきたstatusと期待される次のstatusが一致するか確認
    if (nextStatus !== expectedNextStatus) {
      const errorMessage = ERROR_MESSAGE_STATUS_MISMATCH
        .replace("{expectedStatus}", expectedNextStatus)
        .replace("{receivedStatus}", nextStatus);
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        errorMessage,
        {
          expectedStatus: expectedNextStatus,
          receivedStatus: nextStatus,
        }
      );
    }

    // 7. 承認ステップを作成または更新
    // 現在のステップタイプを決定（承認・差し戻し共通）
    const currentStepType =
      request.status === RequestStatus.PENDING_MANAGER ? StepType.MANAGER : StepType.HR;
    const stepOrder = currentStepType === StepType.MANAGER ? 1 : 2;

    const approvalStatus = isReject
      ? ApprovalStatus.CHANGES_REQUESTED
      : ApprovalStatus.APPROVED;

    await saveApprovalStep(
      {
        requestId: id,
        stepOrder,
        stepType: currentStepType,
        status: approvalStatus,
        actedByEmployeeId: actionData.actedByEmployeeId,
        comment: isReject ? actionData.comment || null : null, // 承認時はコメント不要
        actedAt: new Date(),
      },
      manager
    );

    // 8. 申請のステータスを更新
    request.status = nextStatus;
    if (nextStatus === RequestStatus.COMPLETED) {
      request.completedAt = new Date();
      
      // 8. 申請が完了した場合、employeesテーブルを更新
      await updateEmployeeFromRequestItems(request.employeeId, id, manager);
    }
    await requestRepository.save(request);

    // 8. 更新された申請を取得して返却
    const updatedRequest = await getRequestById(id);
    if (!updatedRequest) {
      throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND);
    }

    return {
      id: updatedRequest.id,
      employeeId: updatedRequest.employeeId,
      status: updatedRequest.status,
      text: updatedRequest.text,
      submittedAt: updatedRequest.submittedAt ? updatedRequest.submittedAt.toISOString() : null,
      completedAt: updatedRequest.completedAt ? updatedRequest.completedAt.toISOString() : null,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
      isHidden: updatedRequest.isHidden,
      items: updatedRequest.items.map((item) => ({
        id: item.id,
        fieldKey: item.fieldKey,
        oldValue: item.oldValue,
        newValue: item.newValue,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  });
}

/**
 * 申請完了時にemployeesテーブルを更新
 * @param employeeId 従業員ID
 * @param requestId 申請ID
 * @param manager トランザクション用のEntityManager
 */
async function updateEmployeeFromRequestItems(
  employeeId: number,
  requestId: number,
  manager: EntityManager
): Promise<void> {
  // 1. 申請項目を取得
  const requestItemRepository = manager.getRepository(RequestItem);
  const requestItems = await requestItemRepository.find({
    where: { requestId },
  });

  if (requestItems.length === 0) {
    return; // 更新する項目がない場合は終了
  }

  // 2. 従業員を取得
  const employeeRepository = manager.getRepository(Employee);
  const employee = await employeeRepository.findOne({ where: { id: employeeId } });
  if (!employee) {
    throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND);
  }

  // 3. 申請項目に基づいて従業員情報を更新
  let hasUpdate = false;
  for (const item of requestItems) {
    if (!item.newValue) {
      continue; // newValueがnullの場合はスキップ
    }

    switch (item.fieldKey) {
      case "firstName":
        employee.firstName = item.newValue;
        hasUpdate = true;
        break;
      case "lastName":
        employee.lastName = item.newValue;
        hasUpdate = true;
        break;
      case "email":
        employee.email = item.newValue;
        hasUpdate = true;
        break;
      case "phone":
        employee.phone = item.newValue;
        hasUpdate = true;
        break;
      case "postalCode":
        employee.postalCode = item.newValue;
        hasUpdate = true;
        break;
      case "address":
        employee.address = item.newValue;
        hasUpdate = true;
        break;
      case "assignments":
        // assignmentsの更新処理
        await updateEmployeeAssignments(employeeId, item.newValue, manager);
        hasUpdate = true;
        break;
      default:
        // その他のフィールドはスキップ
        break;
    }
  }

  // 4. 更新がある場合のみ保存
  if (hasUpdate) {
    await employeeRepository.save(employee);
  }
}

/**
 * 従業員の所属情報（assignments）を更新
 * @param employeeId 従業員ID
 * @param assignmentsJson 新しい所属情報のJSON文字列
 * @param manager トランザクション用のEntityManager
 */
async function updateEmployeeAssignments(
  employeeId: number,
  assignmentsJson: string,
  manager: EntityManager
): Promise<void> {
  try {
    // 1. JSONをパース
    const assignments = JSON.parse(assignmentsJson) as Array<{
      branchId: number;
      departmentId: number;
      positionId: number;
    }>;

    if (!Array.isArray(assignments)) {
      throw new HttpException(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE_ASSIGNMENTS_MUST_BE_ARRAY
      );
    }

    // 2. 既存の所属情報を削除
    const assignmentRepository = manager.getRepository(EmployeeAssignment);
    await assignmentRepository.delete({ employeeId });

    // 3. 新しい所属情報を作成
    const newAssignments = assignments.map((assignment) => {
      const newAssignment = assignmentRepository.create({
        employeeId,
        departmentId: assignment.departmentId,
        branchId: assignment.branchId,
        positionId: assignment.positionId,
        superiorFlag: assignment.positionId !== 1, // positionIdが1（平社員）以外は上長フラグをtrue
      });
      return newAssignment;
    });

    // 4. 新しい所属情報を保存
    if (newAssignments.length > 0) {
      await assignmentRepository.save(newAssignments);
    }
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_MESSAGE_ASSIGNMENTS_UPDATE_FAILED,
      { originalError: error }
    );
  }
}
